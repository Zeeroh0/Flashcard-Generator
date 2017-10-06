
var clozeCard = function(text, cloze) {
	this.fullText = text;
	this.cloze = cloze;
	this.partial = text.replace(cloze, '...');

	this.wrongCloze = function () {
		console.log("\nYour choice of what to withold (your cloze deletion) isn't actually in your text, ya goof!"+
			"\n-----Try again.-----\n");
	};
};



module.exports = clozeCard;
