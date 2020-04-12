import * as dat from 'dat.gui'

// TODO: interpolate between presets
// use pitchController.setValue(10) to set the value between preset1 and deeper 
// and automate back and forth
export const gui = new dat.GUI({
  load: {
    'preset': 'deeper',
    'remembered': {
      'Default': {
        '0': {}
      },
      'preset1': {
        '0': {
          'pitch': 5.331566469093988,
          'attack': 0.8720000000000002,
          'release': 1.320000000000001,
          'density': 0.6591024555461473
        }
      },
      'deeper': {
        '0': {
          'pitch': 0.7274682472480949,
          'attack': 0.05199999999999981,
          'release': 1.320000000000001,
          'density': 0.10635055038103303
        }
      }
    },
    'closed': false,
    'folders': {}
  }
})

export const settings = {
  attack: 0.1,
  release: 0.1,
  pitch: 1,
  density: 1
}

export const pitchController = gui.add(settings, 'pitch', 0.1, 6)

gui.add(settings, 'attack')
gui.add(settings, 'release')
gui.add(settings, 'density', 0, 1)
gui.remember(settings)