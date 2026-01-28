const inputEl = document.getElementById('input');
const outputEl = document.getElementById('output');

const ipPattern = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

function intToIp(ipVal) {
    return `${(ipVal >>> 24) & 0xFF}.${(ipVal >>> 16) & 0xFF}.${(ipVal >>> 8) & 0xFF}.${ipVal & 0xFF}`;
}

function dotToBinaryIp(ipStr) {
    const parts = ipStr.split('.').map(p => parseInt(p));
    return parts.map(part => part.toString(2).padStart(8, '0')).join('.');
}

function parseInput(value) {
    const trimmed = value.trim();
    if (!trimmed) return { error: 'Invalid input' };

    const hasSlash = trimmed.includes('/');
    if (hasSlash) {
        const parts = trimmed.split('/');
        if (parts.length !== 2) return { error: 'Invalid input' };
        const ipStr = parts[0].trim();
        const pLenStr = parts[1].trim();
        if (!ipPattern.test(ipStr) || pLenStr === '') return { error: 'Invalid input' };
        const pLen = Number(pLenStr);
        if (!Number.isInteger(pLen) || pLen < 0 || pLen > 32) return { error: 'Invalid input' };
        return { ipStr, pLen, hasPrefix: true };
    }

    if (!ipPattern.test(trimmed)) return { error: 'Invalid input' };
    return { ipStr: trimmed, hasPrefix: false };
}

function calculate() {
    const input = inputEl.value;
    
    try {
        const parsed = parseInput(input);
        if (parsed.error) {
            outputEl.innerHTML = '<tr><td colspan="2">Invalid input</td></tr>';
            return;
        }

        const { ipStr, pLen, hasPrefix } = parsed;
        
        const ipParts = ipStr.split('.').map(p => parseInt(p));
        const ipInt = ((ipParts[0] << 24) | 
                     (ipParts[1] << 16) | 
                     (ipParts[2] << 8) | 
                     ipParts[3]) >>> 0;
        
        let ipClass;
        if (ipParts[0] < 128) ipClass = "Class A";
        else if (ipParts[0] < 192) ipClass = "Class B";
        else if (ipParts[0] < 224) ipClass = "Class C";
        else if (ipParts[0] < 240) ipClass = "Class D";
        else ipClass = "Class E";

        const res = {
            "IP address": `${dotToBinaryIp(ipStr)} = ${ipStr}`
        };

        if (hasPrefix) {
            const hBits = 32 - pLen;
            const totalIps = Math.pow(2, hBits);
            const usableIps = totalIps >= 2 ? totalIps - 2 : 0;
            const maskInt = (pLen === 0 ? 0 : (0xFFFFFFFF << hBits) >>> 0) >>> 0;
            const netInt = (ipInt & maskInt) >>> 0;
            const hostBitsMask = (Math.pow(2, hBits) - 1) >>> 0;
            const bcastInt = (netInt | hostBitsMask) >>> 0;
            const firstHostInt = netInt + 1;
            const lastHostInt = bcastInt - 1;
            
            const binaryMaskFull = maskInt.toString(2).padStart(32, '0');
            const binaryMaskDotted = `${binaryMaskFull.slice(0,8)}.${binaryMaskFull.slice(8,16)}.${binaryMaskFull.slice(16,24)}.${binaryMaskFull.slice(24)}`;

            res["Subnet mask"] = `${binaryMaskDotted} = ${intToIp(maskInt)} = <b>/${pLen}</b>`;
            res["Network"] = `${dotToBinaryIp(intToIp(netInt))} = ${intToIp(netInt)} \t <i>(${ipClass})</i>`;
            res["Broadcast"] = `${dotToBinaryIp(intToIp(bcastInt))} = ${intToIp(bcastInt)}`;
            res["Host bits"] = `32 - ${pLen} = ${hBits}`;
            res["#IPs"] = `2^${hBits} = ${totalIps}`;
            res["#hosts"] = `${totalIps} - 2 = ${usableIps}`;
            res["min host"] = usableIps > 0 ? `${dotToBinaryIp(intToIp(firstHostInt))} = ${intToIp(firstHostInt)}` : "N/A";
            res["max host"] = usableIps > 0 ? `${dotToBinaryIp(intToIp(lastHostInt))} = ${intToIp(lastHostInt)}` : "N/A";
        }
        
        let html = '';
        for (const [key, value] of Object.entries(res)) {
            html += `<tr><th 
                style="
                text-align: left;
                opacity: 0.6;
                font-weight: normal;
                "
            >${key}</th><td>${value}</td></tr>`;
        }
        outputEl.innerHTML = html;
        
    } catch (e) {
        outputEl.innerHTML = '<tr><td colspan="2">Invalid input</td></tr>';
    }
}

inputEl.addEventListener('input', calculate);
calculate();
