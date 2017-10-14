
var inquirer = require("inquirer");
var fs = require("fs");

// Bring in the exported constructors 
var basicCard = require('./BasicCard.js');
var clozeCard = require("./ClozeCard.js");
// Bring in the intial flash cards
var stockBasicFC = require("./flashcard-jsons/BasicFlashcards.json");
var stockClozeFC = require("./flashcard-jsons/ClozeFlashcards.json");
// Set up for user-created flash cards
var basicFlashcards = require("./flashcard-jsons/userBasicFC.json");
var clozeFlashcards = require("./flashcard-jsons/userClozeFC.json");

var explanation = "\n+++++++++++++++++++++++++++++++++++++++++\n"+
	"  Welcome to the Flash Card Generator!!!  (BEST IF USED IN FULL SCREEN)"+
	"\n+++++++++++++++++++++++++++++++++++++++++\n"+
	"\n\nWith this software, you will get to build your very own flash cards!"+
	// "\neither basic front/back or a cloze-deleted card, fancy!"+
	"\n\nWe've started you off with a few of each to see what those look like,"+
	"\nor feel free to build your own deck of flash cards."+
	"\n\nTo get started, please follow the directions and select what you'd like to do below:"+
	"\n\n---------------------------------\n";



console.log(explanation);

var correctAnswers = 0;
var wrongAnswers = 0;

userStart();



function userStart () {
	inquirer.prompt(
		{
			type: "list",
			name: "createORquiz",
			message: "What would you like to do?",
			choices: ["Create a new flash card", "Quiz me with existing flash cards", "I'm done"]
		}
	).then(function(firstChoice) {
		if (firstChoice.createORquiz === "Create a new flash card") {
			// Ask with kind of FC they want to make.  
			inquirer.prompt(
				{
					type: "list",
					name: "basicORcloze",
					message: "Which type of card to you want to create?",
					choices: [
						'Basic Flash Card   (eg Q: "What color is the sky?" A: "Blue")',
						'Cloze-deleted      (eg Q: "The sky is ... ." A: "blue")'
					]
				}
			).then(function(fcChoice){
				if (fcChoice.basicORcloze === 'Basic Flash Card   (eg Q: "What color is the sky?" A: "Blue")') {
					console.log("\nLet's make a basic flash card!"+
						"\n---------------------------------\n");
					createBasicFC();
				}
				else {
					console.log("Let's make a cloze-deleted flash card!"+
						"\n---------------------------------");
					createClozeFC();
				}
			})
		}
		else if (firstChoice.createORquiz === "Quiz me with existing flash cards") {
			quizMe();
		} else {
			console.log(farewell);
		}
	})
}


var createBasicFC = function() {
	inquirer.prompt([
		{
			type: 'input',
			name: 'front',
			message: 'What will the question be on the front of your flash card?'
		},
		{
			type: 'input',
			name: 'back',
			message: 'What is the answer to the question for the back side of the flash card?'
		}	
	])
		.then(function(basic) {
			var basicFC = new basicCard(basic.front, basic.back);
			basicFlashcards.push(basicFC);

			var newBasicFCArray = JSON.stringify(basicFlashcards, null, 2);
			fs.writeFile("./flashcard-jsons/userBasicFC.json", newBasicFCArray, function(err) {
				if (err) throw err;
				console.log("\n -- Your basic flash card was added to the list! -- \n");
				userStart();
			});
		});
}


var createClozeFC = function () {
	inquirer.prompt([
		{
			type: 'input',
			name: 'fullText',
			message: 'What is the full question?'
		},
		{
			type: 'input',
			name: 'cloze',
			message: 'What portion of the question will you have removed as the answer?'
		}	
	])
		.then(function(cloze) {
			// build the new cloze deletion object w the user's inputs
			var clozeFC = new clozeCard(cloze.fullText, cloze.cloze);
			// make sure they did it right...
			clozeFC.wrongCloze();

			// if not, let them know and start over
			if (clozeFC.itWorked === false) {
				console.log("\nYour choice of what to withold (your cloze deletion) isn't actually in your text, ya goof!"+
					"\n-----Try again!!!-----\n\n");
				createClozeFC();
			} else {
				clozeFlashcards.push(clozeFC);
				var newClozeFCArray = JSON.stringify(clozeFlashcards, null, 2);
				fs.writeFile("./flashcard-jsons/userClozeFC.json", newClozeFCArray, function(err) {
					if (err) throw err;
				});
				console.log("\n -- Good job!  Your cloze-deleted flash card was added to the list! -- \n");
				userStart();
			}
		});
}


var quizMe = function () {
	inquirer.prompt(
		{
			type: "list",
			name: "whosFC",
			message: "Which set of flash cards would you like to use?",
			choices:["My flash cards","Stock flash cards", "Show me ANY flash card!"] 
		}
	).then(function(whosFC) {
		if (whosFC.whosFC === "My flash cards") {
			inquirer.prompt({
				type: "list",
				name: "whatType",
				message: "Which kind of your cards would you like to see?",
				choices:["My basic flash cards","My cloze-deleted flash cards", "Any of my flash cards"] 
			}).then(function(whatType) {
				if (whatType.whatType === "My basic flash cards") {
					userBasicFCQuiz();
				} else if (whatType.whatType === "My cloze-deleted flash cards") {
					userClozeFCQuiz();
				} else {
					var whichjson = Math.floor(Math.random()*2);
					console.log("whichjson: "+whichjson);
					if (whichjson === 1) {
						userBasicFCQuiz();
					} else {
						userClozeFCQuiz();
					}
				}
			});
		} else if (whosFC.whosFC === "Stock flash cards") {
			inquirer.prompt({
				type: "list",
				name: "whatType",
				message: "Which kind of the stock cards would you like to see?",
				choices:["Stock basic flash cards","Stock cloze-deleted flash cards", "Any of the stock flash cards"] 
			}).then(function(whatType) {
				if (whatType.whatType === "Stock basic flash cards") {
					stockBasicFCQuiz();
				} else if (whatType.whatType === "Stock cloze-deleted flash cards") {
					stockClozeFCQuiz();
				} else {
					var whichjson = Math.floor(Math.random()*2);
					if (whichjson === 1) {
						stockBasicFCQuiz();
					} else {
						stockClozeFCQuiz();
					}
				}
			});
		} else {
			randomQuestion();
		}
	})
}


function userBasicFCQuiz () {
	if (basicFlashcards.length < 1) {
		console.log("\nWell this is awkward..."+
			"\nYou haven't made any basic flash cards yet."+
			"\nBetter get to it!!\n");
		nowWhat();
	} else {
		var randomFC = Math.floor(Math.random()*basicFlashcards.length)
		inquirer.prompt({
			type: "input",
			name: "userQuestion",
			message: basicFlashcards[randomFC].front
		}).then(function(userAnswer) {
			if (userAnswer.userQuestion === basicFlashcards[randomFC].back) {
				correctAnswers++;
				console.log("\nCongratulations!!  That is correct!!\n");
				nowWhat();
			} else {
				wrongAnswers++;
				console.log("\nNot quite..."+
					"\nThe correct answer is: "+basicFlashcards[randomFC].back+"\n");
				nowWhat();
			}
		});
	}
}

function userClozeFCQuiz() {
	if (basicFlashcards.length < 1) {
		console.log("\nWell this is awkward..."+
			"\nYou haven't made any basic flash cards yet."+
			"\nBetter get to it!!\n");
		nowWhat();
	} else {
		var randomFC = Math.floor(Math.random()*clozeFlashcards.length)
		inquirer.prompt({
			type: "input",
			name: "userQuestion",
			message: clozeFlashcards[randomFC].partial
		}).then(function(userAnswer) {
			if (userAnswer.userQuestion === clozeFlashcards[randomFC].cloze) {
				correctAnswers++;
				console.log("\nCongratulations!!  That is correct!!\n");
				nowWhat();
			} else {
				wrongAnswers++;
				console.log("\nNot quite..."+
					"\nThe correct answer is: "+clozeFlashcards[randomFC].cloze+"\n");
				nowWhat();
			}
		});
	}
}

function stockBasicFCQuiz () {
	var randomFC = Math.floor(Math.random()*stockBasicFC.length)
	inquirer.prompt({
		type: "input",
		name: "userQuestion",
		message: stockBasicFC[randomFC].front
	}).then(function(userAnswer) {
		if (userAnswer.userQuestion === stockBasicFC[randomFC].back) {
			correctAnswers++;
			console.log("\nCongratulations!!  That is correct!!\n");
			nowWhat();
		} else {
			wrongAnswers++;
			console.log("\nNot quite..."+
				"\nThe correct answer is: "+stockBasicFC[randomFC].back+"\n");
			nowWhat();
		}
	});
}

function stockClozeFCQuiz() {
	var randomFC = Math.floor(Math.random()*stockClozeFC.length)
	inquirer.prompt({
		type: "input",
		name: "userQuestion",
		message: stockClozeFC[randomFC].partial
	}).then(function(userAnswer) {
		if (userAnswer.userQuestion === stockClozeFC[randomFC].cloze) {
			correctAnswers++;
			console.log("\nCongratulations!!  That is correct!!\n");
			nowWhat();
		} else {
			wrongAnswers++;
			console.log("\nNot quite..."+
				"\nThe correct answer is: "+stockClozeFC[randomFC].cloze+"\n");
			nowWhat();
		}
	});
}

function randomQuestion () {
	var whichjson = Math.floor(Math.random()*4);
	console.log(whichjson);
	if (whichjson === 0) {
		stockBasicFCQuiz();
	} else if (whichjson === 1) {
		stockClozeFCQuiz();
	} else if (whichjson === 2 && basicFlashcards.length > 0) {
		userBasicFCQuiz();
	} else if(whichjson === 2 && basicFlashcards.length < 1) {
		randomQuestion();
	} else if (whichjson === 3&& clozeFlashcards.length < 1) {
		randomQuestion();
	}
}



function nowWhat () {
	inquirer.prompt({
		type: "list",
		name: "nowWhat",
		message: "Now what?",
		choices: [
			// 'Try another flash card from that same group',
			'Select new question',
			'Go back to beginning',
			"I'm done. Quit the app."
		]
	}).then(function(nowWhat){
		if (nowWhat.nowWhat === 'Select new question') {
			quizMe();
		} else if (nowWhat.nowWhat === 'Go back to beginning') {
			userStart();
		} else if (nowWhat.nowWhat === "I'm done. Quit the app.") {
			console.log(farewell);
		}
	})
}

var farewell = 
	// "\n\n==============================================\n"+
	// "\nToday you got "+correctAnswers+" questions right and only "+
	// wrongAnswers+" questions wrong."+
	// "\nKeep practicing and improving everyday!"+
	// "\n\n==============================================\n"+
	"\n  Thanks for coming by!\n\n"+
	"\n   ████████████████████████████████████████"+
	"\n   ██████┴┬┴███████████████████████████████"+
	"\n   ████┬┴┬┴┬┴┬█████████████████████████████"+
	"\n   ███┬┴┬████┴┬████████████████████████████"+
	"\n   ██┬┴███████┴┬███████████████████████████"+
	"\n   ██┴┬███████┬┴██┬┴┬████┴┬┴██┬┴┬┴┬████████"+
	"\n   ██┬████┴┬███┬┴┬┴┬┴┬┴┬┴┬┴┬┴┬┴┬┴┬┴┬┴██████"+
	"\n   █┬┴███┴┬┴████┬┴███┴┬┴┬███┬┴█████┴┬┴┬████"+
	"\n   █┴┬███┬┴┬█████████████████████████┬┴┬███"+
	"\n   █┬┴███┴┬┴██████████████████████████┬┴███"+
	"\n   █┴┬███┬┴┬█┬┴┴███┬██████┴████┬┴┬█████┬┴██"+
	"\n   █┬┴███┴┬┴┬┴┬┴┬█┬┴┬████┴┬┴█┴┬┴┬┴┬┴███┴┬██"+
	"\n   █┴┬███┬┴┬┴┬┴┬┴┬█┬┴┬██┴┬┴█┴┬┴┬┴┬┴┬┴██┬┴██"+
	"\n   █┬┴███┴┬┴┬██┴┬┴█┴┬┴██┬┴┬█┬┴┬██┴┬┴███┴┬██"+
	"\n   █┴┬███┬┴┬███┬┴┬█┬┴┬┴█┴┬█┬┴┬┴█┴┬┴┬███┬┴██"+
	"\n   █┬┴███┴┬┴███┴┬┴██┬┴┬┴┬┴█┴┬┴┬┴┬┴██████┬┴█"+
	"\n   █┴┬███┬┴┬███┬┴┬██┴┬┴┬┴┬█┬┴┬┴┬███┬┴███┴┬█"+
	"\n   █┬┴███┴┬┴┬┴┬┴┬┴███┴┬┴┬███┬┴┬┴┬┴┬┴┬███┬┴█"+
	"\n   █┴┬███┬┴┬┴┬┴┬┴████┬┴┬┴███┴┬┴┬┴┬┴┬┴███┴┬█"+
	"\n   █┬┴███┴┬┴┬┴┬┴█████┴┬┴█████┴┬┴┬┴┬█████┬██"+
	"\n   ██┬███████████████┬┴┬███████████████┬┴██"+
	"\n   ██┴┬█████████████┬┴┬███████████████┬┴███"+
	"\n   ██┬┴┬████████████┴┬┴███┴┬████████┴┬┴████"+
	"\n   ███┬┴┬┴┬┴┬┴┬┴┬███┬┴████┬┴┬┴┬┴┬┴┬┴┬┴█████"+
	"\n   █████┴┬┴┬┴┬┴┬┴████████┬┴██┬┴┬┴┬┴┬███████"+
	"\n   █████████████┬████████┴┬████████████████"+
	"\n   █████████████┴┬██████┴┬█████████████████"+
	"\n   ██████████████┴┬┴██┬┴┬██████████████████"+
	"\n   ███████████████┴┬┴┬┴┬███████████████████"+
	"\n   ████████████████████████████████████████\n\n\n\n";




