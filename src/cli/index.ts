import * as readline from 'readline'
import { Game } from 'src/lib';
import { constants } from '../constants'

const validStr = (str: string) => {
    const regx = new RegExp(`^(${constants.coord_cols.join('|')})(${constants.coord_rows.join('|')})$`, 'i')
    return regx.test(str)
}

export class Cli {
    private terminal: readline.Interface;

    constructor(private game: Game) {
        this.terminal = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: 'battleships > '
        })
        this.addListeners()
    }

    private addListeners() {
        this.terminal.on('line', this.onInput.bind(this))
        this.terminal.on('close', this.onClose.bind(this))
    }

    private printBoard() {
        const boardStr =
            "\n" + "- | " + constants.coord_cols.join(' | ') + "\n" +
            constants.coord_rows
                .map(row => `${row} | ${this.game.board.filter(cell => cell.y === row).map(cell => cell.state).join(' | ')}`).join('\n')
        console.log(boardStr)
    }

    private printInstructions() {
        console.log("Enter a letter A-J and a number 0-9 to shoot at the coordinate\nPress ctrl+c to exit\nX = hit | ? = miss | V = sunk")
    }

    private onInput(input: string) {
        const str = input.trim()
        if (!validStr(str)) {
            console.log('\nEnter a valid coordinate (ie: F9)')
            this.terminal.prompt()
        } else {
            this.game.shootAt(str[0].toUpperCase(), Number(str[1]))
            this.printBoard()
            this.terminal.prompt()
            if (this.game.allSunk()) {
                console.log('\nYou sank all ships')
                this.askNew()
            }
        }

    }

    private askNew() {
        this.terminal.question("New round? yes/no > ", (input) => {
            if (['yes', 'y'].includes(input)) {
                this.newRound()
            } else {
                this.terminal.close()
            }
        })
    }

    newRound() {
        this.game.init()
        this.printInstructions()
        this.printBoard()
        this.terminal.prompt()
    }

    private onClose() {
        console.log('\nThanks for playing')
        process.exit(0)
    }


}