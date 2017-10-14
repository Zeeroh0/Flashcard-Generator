
var clozeCard = function(text, cloze) {
	this.fullText = text;
	this.cloze = cloze;
	this.partial = text.replace(cloze, '...');
	this.itWorked = true;

	this.wrongCloze = function () {
		if (text.indexOf(cloze) === -1) {
			this.itWorked = false;	
		}
	};	

};



module.exports = clozeCard;
