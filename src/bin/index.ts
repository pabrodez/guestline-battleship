#!/usr/bin/env node

import { Cli } from '../cli'
import { Game } from '../lib'

const ui = new Cli(new Game())
ui.newRound()