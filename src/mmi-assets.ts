import svg1 from "./mmi/1.svg";
import svg2 from "./mmi/2.svg";
import svg3 from "./mmi/3.svg";
import svg4 from "./mmi/4.svg";
import svg5 from "./mmi/5.svg";
import svg6 from "./mmi/6.svg";
import svg7 from "./mmi/7.svg";
import svg8 from "./mmi/8.svg";
import svg9 from "./mmi/9.svg";
import svg10 from "./mmi/10.svg";
import svg11 from "./mmi/11.svg";
import svg12 from "./mmi/12.svg";
import svg0 from "./mmi/unknown.svg";

const mmiFiles = [
	svg0,
	svg1,
	svg2,
	svg3,
	svg4,
	svg5,
	svg6,
	svg7,
	svg8,
	svg9,
	svg10,
	svg11,
	svg12,
];

export function getMMIAssetURL(mmiValue: number): string {
	return mmiFiles?.[mmiValue] ?? svg0;
}
