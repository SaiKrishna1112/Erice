import { AES, enc, format, mode, pad } from "crypto-js";
import Base64 from "crypto-js/enc-base64";

function decryptEas(data, key, iv) {
  const keys = Base64.parse("h9OfpK2eT1L8kU6PQaHK/w==");
  const ivs = Base64.parse("PaLE/C1iL1IX/o4nmerh5g==");
  return AES.decrypt(data, keys, {
    iv: ivs,
    mode: mode.CBC,
    padding: pad.Pkcs7,
    format: format.Hex,
  }).toString(enc.Utf8);
}

export default decryptEas;
