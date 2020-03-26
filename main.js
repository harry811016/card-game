const GAME_STATE = {
    FirstCardAwaits: 'FirstCardAwaits',
    SecondCardAwaits: 'SecondCardAwaits',
    CardsMatchFailed: 'CardsMatchFailed',
    CardsMatched: 'CardsMatched',
    GameFinished: 'GameFinished'
  }
  const Symbols = [
    'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
    'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Coraz%C3%B3n.svg/1200px-Coraz%C3%B3n.svg.png', // 愛心
    'https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQibk92__qHd_0jFDL-_YXbkrPfEW9iakoA_ECa6Wu5h9M-gWp8', // 方塊
    'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
  ]
  const view = {
    getCardElement (index) {
      return `<div data-index='${index}' class="card back"></div>`
    },
    getCardContent (index) {
      const number = this.transformNumber((index % 13) + 1)
      const symbol = Symbols[Math.floor(index / 13)]
      let textcolor = 'black'
      if (symbol === Symbols[1] || symbol === Symbols[2]) {
        textcolor = 'red'
      }
      return `
        <p class='${textcolor}'>${number}</p>
        <img src="${symbol}">
        <p class='${textcolor}'>${number}</p>
      `
    },
    transformNumber (number) {
      switch (number) {
        case 1:
          return 'A'
        case 11:
          return 'J'
        case 12:
          return 'Q'
        case 13:
          return 'K'
        default:
          return number
      }
    },
    displayCards () {
      const rootElement = document.querySelector('#cards')
      rootElement.innerHTML = utility.getRandomNumberArray(52).map(index => this.getCardElement(index)).join('')
    },
  
    flipCards (...cards) {
      cards.map(card => {
        if (card.classList.contains('back')) {
          // 回傳正面
          card.classList.remove('back')
          card.innerHTML = this.getCardContent(Number(card.dataset.index)) // 暫時給定 10
          return
        }
        // 回傳背面
        card.classList.add('back')
        card.innerHTML = null
      })
    },
  
    pairCards(...cards) {
      cards.map(card => {
        card.classList.add("paired")
      })
    },
  
    renderScore(score) {
      document.querySelector('.score').textContent = `Score : ${score}`
    },
  
    renderTriedTimes(tried) {
      document.querySelector('.tried').textContent = `You've tried: ${tried} times`
    },
  
    appendWrongAnimation(...cards) {
      cards.map(card => {
        card.classList.add('wrong')
        card.addEventListener('animationend', event =>   event.target.classList.remove('wrong'), { once: true })
        })
    },
  
    showGameFinished () {
      const div = document.createElement('div')
      
      div.classList.add('completed')
      div.innerHTML =`
        <p>Complete!</p>
        <p>Score: ${model.score}</p>
        <p>You've tried: ${model.triedtimes} times</p>
        <button type="button" class="btn btn-outline-light">Retry</button>
        `
      const header = document.querySelector('#header')
      header.before(div)
    },
  }
  
  const model = {
    revealedCards: [],
  
    isRevealedCardsMatched() {
      return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13 
    },
  
    score: 0,
  
    triedtimes: 0,
  }
  const controller = {
    currentState: GAME_STATE.FirstCardAwaits,
    
    generateCards () {
      view.displayCards(utility.getRandomNumberArray(52))
    },
  
    dispatchCardAction (card) {
      if (!card.classList.contains('back')) {
        alert('You have already flipped!')
        return
      }
      switch (this.currentState) {
        case GAME_STATE.FirstCardAwaits:
          view.flipCards(card)
          model.revealedCards.push(card)
          this.currentState = GAME_STATE.SecondCardAwaits
          break
        case GAME_STATE.SecondCardAwaits:
          view.flipCards(card)
          model.revealedCards.push(card)
  
          view.renderTriedTimes(model.triedtimes += 1)
          // 判斷配對是否成功
          if (model.isRevealedCardsMatched()) {
            // 配對成功
            view.renderScore(model.score += 10)
            this.currentState = GAME_STATE.CardsMatched
            view.pairCards(...model.revealedCards)
            if (model.score === 260) {
              this.currentState = GAME_STATE.GameFinished
              view.showGameFinished()
              return
            }
            model.revealedCards = []
            this.currentState = GAME_STATE.FirstCardAwaits
          } else {
            // 配對失敗
            this.currentState = GAME_STATE.CardsMatchFailed
            view.appendWrongAnimation(...model.revealedCards)
            setTimeout(this.resetCards, 1000)
          }
          break
      }
      console.log('this.currentState', this.currentState)
      console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
    },
  
    resetCards() {
      view.flipCards(...model.revealedCards)
      model.revealedCards = []
      controller.currentState = GAME_STATE.FirstCardAwaits
    }
  }
  const utility = {
    getRandomNumberArray (count) {
      const number = Array.from(Array(count).keys())
      for (let index = number.length - 1; index > 0; index--) {
        let randomIndex = Math.floor(Math.random() * (index + 1))
          ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
      }
      return number
    }
  }
  controller.generateCards()
  
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event => {
      controller.dispatchCardAction(card)
    })
  })
  
  document.querySelector('body').addEventListener('click', event => {
    if (event.target.classList.contains("btn-outline-light")) {
      window.location.reload()
      console.log('hi')
    }
  })