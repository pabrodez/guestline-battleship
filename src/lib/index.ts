import { constants } from '../constants'

export enum Orientation {
    Horizontal,
    Vertical
}

export enum Shot {
    Hit = "X",
    Miss = "?",
    Unhit = ".",
    Sunk = "V",
}

export interface Coordinate {
    x: string,
    y: number,
    state: Shot
}

const randomInd = (max: number, min?: number) => Math.floor(Math.random() * (max - (min ?? 0) + 1) + (min ?? 0));
// if we were to select n items from an indexable, what is the last index where we could start from without accesing past the last index
const maxValidIndex = (lastIndex: number, lengthOut: number) => lastIndex - lengthOut + 1;
const randomRange = (length: number, arr: string[] | number[]): string[] | number[] => {

    const top = maxValidIndex(arr.length - 1, length)
    const start = randomInd(top)
    const range = arr.slice(start, start + length)

    return range
}

export class Ship {
    coordinates: Coordinate[]

    constructor(public length: number) {
        this.coordinates = this.createCoordinates()
    }

    overlapsShip(ship: Ship) {
        return this.coordinates.some(coord => ship.hasCoordinate(coord))
    }

    private hasCoordinate(coord: Coordinate) {
        return this.coordinates.some(a => a.x === coord.x && a.y === coord.y)
    }

    isSunk() {
        return this.coordinates.every(a => a.state === Shot.Hit)
    }

    getShot(x: string, y: number): Shot {
        const shot = this.coordinates.find(a => a.x === x && a.y === y)
        if (!shot) return Shot.Miss
        shot.state = Shot.Hit
        if (this.isSunk()) return Shot.Sunk
        return Shot.Hit
    }

    private createCoordinates(): Coordinate[] {
        const randomCoord = [Orientation.Horizontal, Orientation.Vertical][randomInd(1)]
        let coords: Coordinate[];
        if (randomCoord === Orientation.Horizontal) {
            const randomRow = constants.coord_rows[randomInd(constants.coord_rows.length - 1)]
            const colSeq = randomRange(this.length, [...constants.coord_cols])
            coords = colSeq.map((col: any) => ({ x: col, y: randomRow, state: Shot.Unhit }))
        } else {
            const randomCol = constants.coord_cols[randomInd(constants.coord_cols.length - 1)]
            const rowSeq = randomRange(this.length, [...constants.coord_rows])
            coords = rowSeq.map((row: any) => ({ x: randomCol, y: row, state: Shot.Unhit }))
        }
        return coords
    }
}

export class Game {
    readonly BATTLESHIPS = {
        n: 1, size: 5
    }
    readonly DESTROYERS = {
        n: 2, size: 4
    }
    public ships: Ship[] = []
    public board: Coordinate[] = []

    constructor() {
        this.init()
    }

    private createShip(size: number) {
        let ship = new Ship(size)
        let overlapsShip = this.ships.some(a => a.overlapsShip(ship))
        // to make it safer we would like to stop after trying for a few seconds
        const end = Date.now() + 5_000
        while (overlapsShip && Date.now() < end) {
            ship = new Ship(size)
            overlapsShip = this.ships.some(a => a.overlapsShip(ship))
        }
        if (overlapsShip) throw new Error('Took to long to randomly place a ship')
        return ship
    }

    private addShips() {
        Array(this.BATTLESHIPS.n).fill(this.BATTLESHIPS.size)
            .concat(Array(this.DESTROYERS.n).fill(this.DESTROYERS.size))
            .forEach((a: any) => this.ships.push(this.createShip(a)))
    }

    shootAt(x: string, y: number) {
        const i = this.board.findIndex(c => c.x === x && c.y === y)
        if (this.board[i].state !== Shot.Unhit) return;
        for (const ship of this.ships) {
            const result = ship.getShot(x, y)
            this.board[i].state = result
            if ([Shot.Sunk, Shot.Hit].includes(result)) return;
        }
    }

    allSunk() {
        return this.ships.every(a => a.isSunk())
    }

    private createBoard() {
        for (const col of constants.coord_cols) {
            for (const row of constants.coord_rows) {
                this.board.push({ x: col, y: row, state: Shot.Unhit })
            }
        }
    }

    private reset() {
        this.ships = []
        this.board = []
    }

    init() {
        this.reset()
        this.createBoard()
        this.addShips()
    }

}