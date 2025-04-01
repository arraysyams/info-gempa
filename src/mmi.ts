const mmiArray = [
	"",
	"I",
	"II",
	"III",
	"IV",
	"V",
	"VI",
	"VII",
	"VIII",
	"IX",
	"X",
	"XI",
	"XII",
];

export function mmiToNumber(mmiStr: string): number {
	return mmiArray.findIndex((mmi) => mmi == mmiStr.toUpperCase());
}

export function numberToMMI(mmiValue: number): string {
	return mmiArray?.[mmiValue] ?? "";
}

const mmiRegex = new RegExp(
	/\b(xii|xi|x|ix|viii|vii|vi|v|iv|iii|ii|i)\b/,
	"gmi"
);

export function splitMMIPlace(text: string) {
	const matches = text.matchAll(mmiRegex);

	const matchResult: {
		mmi: {
			text: string;
			value: number;
		}[];
		place: string;
	} = {
		mmi: [],
		place: "",
	};

	// Variable to keep track of mmi position in the text
	let firstMMIIndex = null;
	let lastMMIIndex = null;

	/**
	 * Iterate through matches
	 *
	 * Each match contains an array with an accessible properties called "index"
	 * which tells us the position of the matched component in text
	 *
	 * For example: "IV-V Some Location"
	 * The first match returns ["IV", "IV"] with the index of 0
	 * While the second match returns ["V", "V"] with the index of 3
	 */
	for (const match of matches) {
		matchResult.mmi.push({
			text: match[0].toUpperCase(),
			value: mmiToNumber(match[0]),
		});

		// Mark the left side of mmi values
		const firstMatchIndex = match.index;
		firstMMIIndex =
			typeof firstMMIIndex == "number"
				? Math.min(firstMatchIndex, firstMMIIndex)
				: firstMatchIndex;

		// Mark the right side
		const lastMatchIndex = match.index + match[0].length;
		lastMMIIndex =
			typeof lastMMIIndex == "number"
				? Math.max(lastMatchIndex, lastMMIIndex)
				: lastMatchIndex;
	}

	// Slice and remove the mmi from the place name
	if (typeof firstMMIIndex == "number" && typeof lastMMIIndex == "number") {
		const mmiPartOfText = text.slice(firstMMIIndex, lastMMIIndex);
		const placeNameOfText = text.replace(mmiPartOfText, "").trim();
		matchResult.place =
			placeNameOfText.length > 0 ? placeNameOfText : text.trim();
	} else {
		matchResult.place = text.trim();
	}

	return matchResult;
}
