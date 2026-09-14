export class ZipBuilder {
    constructor() {
        this.files = [];
    }

    static crcTable = (() => {
        let c;
        const table = [];
        for (let n = 0; n < 256; n++) {
            c = n;
            for (let k = 0; k < 8; k++) {
                c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            table[n] = c >>> 0;
        }
        return table;
    })();

    static crc32(buf) {
        let crc = 0 ^ (-1);
        for (let i = 0; i < buf.length; i++) {
            crc = (crc >>> 8) ^ ZipBuilder.crcTable[(crc ^ buf[i]) & 0xFF];
        }
        return (crc ^ (-1)) >>> 0;
    }

    addFile(name, content) {
        let data;
        if (typeof content === 'string') {
            data = new TextEncoder().encode(content);
        } else if (content instanceof Uint8Array) {
            data = content;
        } else if (content instanceof ArrayBuffer) {
            data = new Uint8Array(content);
        } else {
            throw new Error('Unsupported content type');
        }
        this.files.push({ name: name.replace(/\\/g, '/').replace(/^\/+/, ''), data });
    }

    async buildBlob() {
        const localHeaders = [];
        const centralEntries = [];
        let offset = 0;

        for (const file of this.files) {
            const nameBytes = new TextEncoder().encode(file.name);
            const dataBytes = file.data;
            const crc = ZipBuilder.crc32(dataBytes);
            const size = dataBytes.length;

            // Date / Time: 2026-09-14 12:00:00 (MS-DOS format)
            const dosTime = (12 << 11) | (0 << 5) | (0 >> 1);
            const dosDate = ((2026 - 1980) << 9) | (9 << 5) | 14;

            // Local file header (30 bytes + filename)
            const lfh = new Uint8Array(30 + nameBytes.length);
            const viewLfh = new DataView(lfh.buffer);
            viewLfh.setUint32(0, 0x04034b50, true); // signature
            viewLfh.setUint16(4, 20, true); // version needed (2.0)
            viewLfh.setUint16(6, 0x0800, true); // general purpose bit flag (UTF-8)
            viewLfh.setUint16(8, 0, true); // compression method (0 = STORE)
            viewLfh.setUint16(10, dosTime, true);
            viewLfh.setUint16(12, dosDate, true);
            viewLfh.setUint32(14, crc, true);
            viewLfh.setUint32(18, size, true); // compressed size
            viewLfh.setUint32(22, size, true); // uncompressed size
            viewLfh.setUint16(26, nameBytes.length, true);
            viewLfh.setUint16(28, 0, true); // extra field length
            lfh.set(nameBytes, 30);

            localHeaders.push(lfh, dataBytes);

            // Central directory entry (46 bytes + filename)
            const cde = new Uint8Array(46 + nameBytes.length);
            const viewCde = new DataView(cde.buffer);
            viewCde.setUint32(0, 0x02014b50, true); // signature
            viewCde.setUint16(4, 20, true); // version made by
            viewCde.setUint16(6, 20, true); // version needed
            viewCde.setUint16(8, 0x0800, true); // flags (UTF-8)
            viewCde.setUint16(10, 0, true); // compression method
            viewCde.setUint16(12, dosTime, true);
            viewCde.setUint16(14, dosDate, true);
            viewCde.setUint32(16, crc, true);
            viewCde.setUint32(20, size, true);
            viewCde.setUint32(24, size, true);
            viewCde.setUint16(28, nameBytes.length, true);
            viewCde.setUint16(30, 0, true); // extra field len
            viewCde.setUint16(32, 0, true); // comment len
            viewCde.setUint16(34, 0, true); // disk number start
            viewCde.setUint16(36, 0, true); // internal file attributes
            viewCde.setUint32(38, 0, true); // external file attributes
            viewCde.setUint32(42, offset, true); // relative offset of local header
            cde.set(nameBytes, 46);

            centralEntries.push(cde);

            offset += lfh.length + dataBytes.length;
        }

        const cdOffset = offset;
        let cdSize = 0;
        for (const cde of centralEntries) {
            cdSize += cde.length;
        }

        // End of central directory record (22 bytes)
        const eocd = new Uint8Array(22);
        const viewEocd = new DataView(eocd.buffer);
        viewEocd.setUint32(0, 0x06054b50, true); // signature
        viewEocd.setUint16(4, 0, true); // disk number
        viewEocd.setUint16(6, 0, true); // disk where central directory starts
        viewEocd.setUint16(8, this.files.length, true); // number of central directory records on this disk
        viewEocd.setUint16(10, this.files.length, true); // total number of central directory records
        viewEocd.setUint32(12, cdSize, true); // size of central directory
        viewEocd.setUint32(16, cdOffset, true); // offset of central directory
        viewEocd.setUint16(20, 0, true); // comment length

        // Combine into single Uint8Array
        const totalSize = offset + cdSize + 22;
        const out = new Uint8Array(totalSize);
        let pos = 0;
        for (const chunk of localHeaders) {
            out.set(chunk, pos);
            pos += chunk.length;
        }
        for (const cde of centralEntries) {
            out.set(cde, pos);
            pos += cde.length;
        }
        out.set(eocd, pos);

        return new Blob([out], { type: "application/zip" });
    }
}
