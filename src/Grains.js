import p5 from 'p5'
import 'p5/lib/addons/p5.dom'
import { differenceAccuracy } from './MotionDetection'
import { map } from './utils'
import { settings } from './presets'

const ID = 'grains'

export default class Grains {
  constructor (granular) {
    let grains = []
    let capture
    let prevFrame
    let blended
    let sourceData
    let blendedData
 

    const s = (sketch) => {
      sketch.setup = function () {
        const canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight)
        // const canvas = sketch.createCanvas(0, 0)
        canvas.parent('canvases')

        sketch.rectMode(sketch.CENTER)
        sketch.ellipseMode(sketch.CENTER)
        sketch.fill('#FFF')
        sketch.stroke('blue')
        sketch.strokeWeight(2)

        granular.on('grainCreated', (grain) => {
          const { position } = grain

          const x = map(position, 0, 1, 0, sketch.width)

          grain = {
            x,
            y: sketch.height / 2
          }

          grains.push(grain)

          setTimeout(() => {
            grains = grains.filter(g => g !== grain)
          }, 200)
        })

     
          capture = sketch.createCapture(sketch.VIDEO)
          capture.size(sketch.displayWidth, sketch.displayHeight)
          capture.hide()

          sourceData = sketch.createImage(sketch.width, sketch.height)
          prevFrame = sketch.createImage(sketch.width, sketch.height)
          blended = sketch.createImage(sketch.width, sketch.height)
          blendedData = sketch.createImage(sketch.width, sketch.height)
          sourceData.loadPixels()
          blended.loadPixels()
          prevFrame.loadPixels()

          sketch.frameRate(15)

      }

      sketch.draw = function () {
        sketch.clear()

     
          getMovement(capture, sourceData, prevFrame, blended)
          checkAreas(blendedData, blended)
     
      }

      // Comment out temporarily so I can mess with peer-js
      // sketch.mousePressed = function () {
      //   granular.startVoice({
      //     id: ID,
      //     position: map(sketch.mouseX, 0, sketch.width, 0, 1),
      //     volume: 0.5
      //   })
      // }

      // sketch.mouseDragged = function () {
      //   granular.updateVoice(ID, {
      //     position: map(sketch.mouseX, 0, sketch.width, 0, 1),
      //     volume: 0.5
      //   })
      // }

      // sketch.mouseReleased = function () {
      //   granular.stopVoice(ID)
      // }

      sketch.windowResized = function () {
        sketch.resizeCanvas(sketch.windowWidth, sketch.windowHeight)
      }

      function getMovement (capture, sourceData, prevFrame, blended) {
        sourceData.copy(capture, 0, 0, sketch.width, sketch.height, 0, 0, sketch.width, sketch.height)
        sourceData.loadPixels()
        prevFrame.loadPixels()

        differenceAccuracy(blended, sourceData.pixels, prevFrame.pixels)
        blended.updatePixels()
        sourceData.updatePixels()
        prevFrame.updatePixels()

        sketch.image(blended, 0, 0, sketch.width, sketch.height)
        prevFrame.copy(sourceData, 0, 0, sketch.width, sketch.height, 0, 0, sketch.width, sketch.height)
      }

      function checkAreas (blendedData, blended) {
        // loop over the note areas
        const num = 8
        let isSeen = false
        for (var r = 0; r < num; ++r) {
          // blendedData.copy(blended, 0, 0, sketch.width, sketch.height, 1 / num * r * sketch.width, 0, sketch.width / num, sketch.height)
          blendedData.copy(blended, 0, 0, sketch.width, sketch.height, 0, 0, sketch.width , sketch.height)

          blendedData.loadPixels()

          var i = 0
          var average = 0
          // loop over the pixels
          while (i < (blendedData.pixels.length * 0.25)) {
            // make an average between the color channel
            average += (blendedData.pixels[i * 4] + blendedData.pixels[i * 4 + 1] + blendedData.pixels[i * 4 + 2]) / 3
            ++i
          }

          // calculate an average between of the color values of the note area
          average = Math.round(average / (blendedData.pixels.length * 0.25))
          
          // TODO: send message from here that changes others presets
          if (average > 100 && !isSeen) {
            isSeen = true
            sketch.fill(255, 0, 0)
            sketch.rect(1 / num * r * sketch.width, 0, sketch.width / num, sketch.height)
            
            settings.endPreset = 'deeper'
            console.log("Grains -> checkAreas -> settings.endPreset", settings.endPreset)
          } else {
            if (isSeen) {
              isSeen = false
            }
            console.log("Grains -> checkAreas -> settings.endPreset", settings.endPreset)
          }
        }
      }
    }

    new p5(s)
  }
}
