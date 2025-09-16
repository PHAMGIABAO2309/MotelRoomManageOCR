// Fix: Removed unused 'defaultNumbers' constant which had a type error.
const chuHangDonVi = (' không một hai ba bốn năm sáu bảy tám chín').split(' ');
const chuHangChuc = (' lẻ một hai ba bốn năm sáu bảy tám chín').split(' ');
const chuHangTram = (' không một hai ba bốn năm sáu bảy tám chín').split(' ');

function convert_block_three(number: number): string {
  if (number === 0) return '';
  let _a: string[] = number.toString().padStart(3, '0').split('');
  let i = parseInt(_a[0]);
  let j = parseInt(_a[1]);
  let k = parseInt(_a[2]);
  let toReturn = "";
  if (i > 0) {
    toReturn += chuHangTram[i] + " trăm ";
    if ((j === 0) && (k !== 0)) toReturn += " linh ";
  }
  if ((j > 0) && (j !== 1)) {
    toReturn += chuHangChuc[j] + " ";
    if ((k === 0) && (j > 0)) toReturn = toReturn.slice(0, -1) + " mươi ";
  }
  if (j === 1) toReturn += " mười ";
  switch (k) {
    case 1:
      if ((j !== 0) && (j !== 1)) {
        toReturn += " mốt ";
      } else {
        toReturn += chuHangDonVi[k] + " ";
      }
      break;
    case 5:
      if (j === 0) {
        toReturn += " lăm ";
      } else {
        toReturn += chuHangDonVi[k] + " ";
      }
      break;
    case 0:
      if (j === 0 && i === 0) {
        toReturn = "";
      } else if (j !== 0) {
        // no op
      } else {
        toReturn = toReturn.slice(0, -1);
      }
      break;
    default:
      if (k > 0) {
        toReturn += chuHangDonVi[k] + " ";
      }
  }
  return toReturn.trim();
}

export function numberToWords(number: number): string {
    if (number === 0) return 'Không';
    const str = number.toString();
    let i = str.length;
    let toReturn = "";
    let i_str = "";
    while (i > 0) {
        let i_3 = i - 3 > 0 ? i - 3 : 0;
        i_str = str.substring(i_3, i);
        let block = convert_block_three(parseInt(i_str));
        if (block) {
            switch (Math.floor((str.length - i_3 - 1) / 3)) {
                case 1:
                    toReturn = block + " nghìn " + toReturn;
                    break;
                case 2:
                    toReturn = block + " triệu " + toReturn;
                    break;
                case 3:
                    toReturn = block + " tỷ " + toReturn;
                    break;
                default:
                    toReturn = block + " " + toReturn;
            }
        }
        i = i_3;
    }
    toReturn = toReturn.trim();
    return toReturn.charAt(0).toUpperCase() + toReturn.slice(1);
}