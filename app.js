//get random word when the page loads :
let correctWord;
const messedUpWordDOM = document.querySelector("h2.messedUp-word");
window.addEventListener("DOMContentLoaded", getRandomWord);

async function getRandomWord (event, isRefresh = false){
    //isRefresh == true ,means user clicked on refresh word button 
    if(event.currentTarget != window){
        isRefresh = true;
    }

    //fetch correct word :
    const response = await fetch("https://random-word-api.vercel.app/api?words=1");
    correctWord = await response.json();
    correctWord = correctWord[0];

    //scramble word(make incorrect word) :
    const sizeOfWord = correctWord.length;
    const positions = [];
    while(positions.length < sizeOfWord){
        const randomNumber = parseInt(Math.random() * sizeOfWord);
        if(!positions.includes(randomNumber)){
            positions.push(randomNumber);
        }
    }
    //show scramble word in DOM :
    messedUpWordDOM.innerHTML = positions.map(position => {
        return `<span>${correctWord[position]}</span>`;
    }).join("");

    getInformationAboutCorrectWord(isRefresh, correctWord);
}

let countDown;

async function getInformationAboutCorrectWord(isRefresh, correctWord){
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${correctWord}`);
    let data = response.json();
    const informations = await data;

    //get hintDOM element
    const hintDOM = document.querySelector(".hint");
    if(hintDOM.classList.contains("warning")){
        hintDOM.classList.remove("warning");
    }

    //if word does not exsits
    if(response.status == 404){
        hintDOM.textContent = `Hint : please click on refresh button, this word does not exsits`;
        hintDOM.classList.add("warning");
        return; 
    }
    
    //get defenition for correct word :
    let defenition = informations[0]["meanings"][0]["definitions"][0]["definition"];
    
    //show defenition in DOM :
    hintDOM.textContent = `Hint : ${defenition}`; 
    
    //count down : 
    const NeedTimeForEveryWord = 5;         //5 seconds
    const timeLimitDOM = document.querySelector(".time-limit");
    let timeLimitNumber = correctWord.length * NeedTimeForEveryWord;
    //for prevent one second delay, I do this work :
    timeLimitDOM.textContent = `Time limit : ${timeLimitNumber}s`;
    timeLimitNumber--;

    if(isRefresh){
        //clearInterval previous countDown 
        clearInterval(countDown);
    }
    countDown = setInterval(() => {
        if(timeLimitNumber == 0){
            clearInterval(countDown);
            const gameOverMessage = document.querySelector(".gameOver-message");
            gameOverMessage.classList.add("show");
            gameOverMessage.querySelector("h3").textContent = `The word was "${correctWord}"`;
            const gameOverMusic = document.querySelector(".gameOver-music");
            gameOverMusic.play();
        }
        timeLimitDOM.textContent = `Time limit : ${timeLimitNumber}s`;
        timeLimitNumber--;
    }, 1000);

    //focus input
    const input = document.querySelector("input");
    input.focus();
    input.addEventListener("keyup", paintSelectedWords);
}

function paintSelectedWords(event){
    const value = event.currentTarget.value.toLowerCase();        //input value
    const spans =  [...messedUpWordDOM.children];   //span in h2
    //at first remove colored class from all sapns
    spans.map(span => {
        if(span.classList.contains("colored")){
            span.classList.remove("colored");
        }
    })
    
    //number of any character
    let valueObject = {};
    for (const char of value) {
        valueObject[char] ? valueObject[char]++ : valueObject[char] = 1;
    }
    
    for (const span of spans) {
        for (const key in valueObject) {
            if(span.textContent == key && valueObject[key] > 0){
                span.classList.add("colored");
                valueObject[key]--;
            }
        }
    }
    
}

const form = document.querySelector("form");
form.addEventListener("submit", checkWord);

function checkWord (e){
    e.preventDefault();
    const input = document.querySelector("input");
    const value = input.value.toLowerCase();

    //message to user :
    const victoryMessage = document.querySelector(".victory-message");
    const victoryMusic = document.querySelector(".victory-music");
    if(value == correctWord){
        clearInterval(countDown);
        victoryMessage.classList.add("show");
        victoryMusic.play();
    }
}

//refresh word button :
const refreshWordButton = document.querySelector("#refresh-btn");
refreshWordButton.addEventListener("click", getRandomWord);