import { Ship, Game, Shot } from './lib'
import { constants } from './constants'

// for some reason VS Code complaints about flatMap, tho esnext and iterable are on the lib list of transpiler   
const allCoordinates = constants.coord_cols
    .flatMap(col => constants.coord_rows.map(row => ({ x: col, y: row, state: Shot.Unhit })))

describe('Class Ship', () => {

    afterEach(() => {
        jest.spyOn(global.Math, 'random').mockRestore()
    })

    it("Uses edges of board", () => {
        // random cannot be seeded so we mock it
        // 0 = A, 0.1 = B, 0.2 = C, etc
        // < 0.5 = horizontal, >= 0.5 = vertical
        const mockRan = jest.spyOn(global.Math, 'random').mockReturnValue(0.9)
        const a = new Ship(5)
        expect(
            a.coordinates.every(coord => coord.x === 'J')
            && a.coordinates.some(coord => coord.y === 9)
        ).toBeTruthy()

        mockRan.mockReturnValue(0)
        const b = new Ship(5)
        expect(
            b.coordinates.every(coord => coord.y === 0)
            && b.coordinates.some(coord => coord.x === 'A')
        ).toBeTruthy()
    })

    it("Detects if overlaps with another ship", () => {

        const mockRan = jest.spyOn(global.Math, 'random')

        mockRan.mockReturnValue(0.4)
        const a = new Ship(4)
        const b = new Ship(4)
        expect(a.overlapsShip(b)).toBeTruthy()

        mockRan.mockReturnValue(0.4)
        const c = new Ship(4)
        mockRan.mockReturnValue(0.5)
        const d = new Ship(5)
        expect(c.overlapsShip(d)).toBeTruthy()

        mockRan.mockReturnValue(0.9)
        const e = new Ship(5)
        mockRan.mockReturnValue(0.5)
        const f = new Ship(5)
        expect(e.overlapsShip(f)).toBeFalsy()

    })

    it("Sinks when all used coords are hit", () => {
        const mockRan = jest.spyOn(global.Math, 'random')
        mockRan.mockReturnValue(0.4)
        const a = new Ship(4)
        const shots = [{ x: 'C', y: 4, },
        { x: 'D', y: 4 },
        { x: 'E', y: 4 },
        { x: 'F', y: 4 }]
        for (const { x, y } of shots) {
            expect(a.isSunk()).toBeFalsy()
            a.getShot(x, y)
        }
        expect(a.isSunk()).toBeTruthy()

        mockRan.mockReturnValue(0.5)
        const b = new Ship(4)
        for (const { x, y } of shots) {
            b.getShot(x, y)
        }
        expect(b.isSunk()).toBeFalsy()
    })

    it("Returns the accuracy of the shot", () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.25)
        const a = new Ship(4)
        expect(a.getShot('B', 2)).toBe(Shot.Hit)
        expect(a.getShot('E', 1)).toBe(Shot.Miss)
        expect(a.getShot('C', 2)).toBe(Shot.Hit)
        expect(a.getShot('D', 2)).toBe(Shot.Hit)
        expect(a.getShot('E', 2)).toBe(Shot.Sunk)
    })

})

describe('Class Game', () => {

    it('Creates 3 ships: 2 with 4 cells and 1 with 5', () => {
        const a = new Game()
        const battleships = a.ships.filter(b => b.length === 5)
        const destroyers = a.ships.filter(b => b.length === 4)
        expect(battleships).toHaveLength(1)
        expect(destroyers).toHaveLength(2)
        expect(battleships.every(b => b.coordinates.length === 5)).toBeTruthy()
        expect(destroyers.every(b => b.coordinates.length === 4)).toBeTruthy()
    })

    it('Throws an error if takes too long to randomly place a ship', () => {
        jest.spyOn(global.Math, 'random').mockReturnValue(0.4)
        expect(() => new Game()).toThrowError()
        jest.spyOn(global.Math, 'random').mockRestore()
    })

    it('Creates a 10 x 10 board of letters and numbers', () => {
        const a = new Game()
        expect(a.board).toHaveLength(100)
        a.board.forEach(c => expect(allCoordinates).toContainEqual(c))
    })

    it('All ships should be sunk if all squares are hit', () => {
        const a = new Game()
        expect(a.allSunk()).toBeFalsy()
        allCoordinates.forEach(({ x, y }) => a.shootAt(x, y))
        expect(a.allSunk()).toBeTruthy()
    })

    it('Changes the state of a coordinate when shot fired', () => {
        const a = new Game()
        const hitShots = [{ x: 'C', y: 4, },
        { x: 'D', y: 4 },
        { x: 'E', y: 4 }]
        const sinkShot = { x: 'F', y: 4 }
        const missShot = { x: 'I', y: 1 }

        const mockRan = jest.spyOn(global.Math, 'random')
        mockRan.mockReturnValue(0.4)
        a.ships = [new Ship(4)]

        hitShots.forEach(({ x, y }) => {
            a.shootAt(x, y)
            expect(a.board.find(cell => cell.x === x && cell.y === y)?.state).toBe(Shot.Hit)
        })

        a.shootAt(missShot.x, missShot.y)
        expect(a.board.find(cell => cell.x === missShot.x && cell.y === missShot.y)?.state).toBe(Shot.Miss)

        a.shootAt(sinkShot.x, sinkShot.y)
        expect(a.board.find(cell => cell.x === sinkShot.x && cell.y === sinkShot.y)?.state).toBe(Shot.Sunk)

        jest.spyOn(global.Math, 'random').mockRestore()
    })
})