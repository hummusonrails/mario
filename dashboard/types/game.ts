export interface PlayerStats {
    coinsCollected: number
    fireballsShot: number
    enemiesDefeated: number
    reachedFlag: boolean
    flagPoleHeight: number
  }
  
  export interface PlayerAction {
    jumping: boolean
    running: boolean
    crouching: boolean
    movingLeft: boolean
    movingRight: boolean
  }
  
  export interface GameState {
    action?: PlayerAction
    playerStats: PlayerStats
    position?: [number, number]
    velocity?: [number, number]
  }
  
  export interface GameplayState {
    timestamp: string
    state: {
      timestamp: string
      state: GameState
    }
  }
  
  export interface PlayerData {
    name: string
    email: string
    company: string
    job_title: string
    consent: boolean
    gameplay: {
      startTime: string
      states: GameplayState[]
      score: number
      lives: number
    }
    cumulativeStats: PlayerStats
  }
  
  