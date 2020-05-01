import p5 from 'p5'
import 'p5/lib/addons/p5.dom'
import { differenceAccuracy } from './MotionDetection'
import { resetPreset } from './utils'
import { send, joined } from './Peers'

const ID = 'grains'
export let isSeen = true; 
export default class Grains {
  constructor () {
    let capture
    let prevFrame
    let blended
    let sourceData
		let blendedData
		
		const chars = ["\u2581", "\u2582", "\u2592", "\u2591", "\u258f", "\u258e", "\u258d", "\u258c"]
		let sampleSize = 25;
		const maxColor = 765;// 255*3

		const hueValues = [];
		const saturationValues = [];
		const brightnessValues = [];
		const opacityValues = [];

		let xoff = 0.0
    
    const s = (sketch) => {
      sketch.setup = function () {
        const canvas = sketch.createCanvas(sketch.windowWidth, sketch.windowHeight)
				canvas.parent('canvases')	

				sketch.noLoop()
				sketch.textAlign(sketch.CENTER, sketch.CENTER);
				sketch.textSize(sampleSize);

				sketch.shuffle(chars, true)
				// init with random values
				for (var i = 0; i < sampleSize; i++) {
					hueValues[i] = sketch.random(360);
					saturationValues[i] = sketch.random(100);
					if (i % 15 == 0) {
						brightnessValues[i] = 0;
					} else {
						brightnessValues[i] = 100;
					}
					opacityValues[i] = sketch.random(255)
				}

				// restart the sketch after capture loads
				capture = sketch.createCapture(sketch.VIDEO, () => sketch.loop())
        capture.size(sketch.displayWidth, sketch.displayHeight)        
        capture.hide()

        sourceData = sketch.createImage(sketch.width, sketch.height)
        prevFrame = sketch.createImage(sketch.width, sketch.height)
        blended = sketch.createImage(sketch.width, sketch.height)
        blendedData = sketch.createImage(sketch.width, sketch.height)
        sourceData.loadPixels()
        blended.loadPixels()
        prevFrame.loadPixels()

				sketch.frameRate(5)
				
				sketch.colorMode(sketch.HSB, 360, 100, 100, 100);
				sketch.noStroke();
      }

      sketch.draw = function () {
				sketch.background(0, 0, 100);

				xoff = xoff + 0.1;
				sampleSize = sketch.floor(sketch.map(sketch.noise(xoff), 0, 1, 5, 35));

				for (let y = 0; y < sketch.displayHeight; y += sampleSize) {
					for (let x = 0; x < sketch.displayWidth; x += sampleSize) {
						const i = ((y * sketch.displayWidth) + x) * 4;

						const r = capture.pixels[i];
						const g = capture.pixels[i + 1];
						const b = capture.pixels[i + 2];
						let index = sketch.floor((r + g + b) / maxColor * (chars.length - 1));

						// change colors
						// check if it has values
						if (joined) {
							sketch.fill(hueValues[index], saturationValues[index], brightnessValues[index], opacityValues[index])
							sketch.text(chars[index], x, y)
						} else {
							sketch.fill(360, 100, 100)
							sketch.text("\\", x, y)
						}
					}
				}
				
				getMovement(capture, sourceData, prevFrame, blended)

				if (joined) {
					checkAreas(blendedData, blended)
				}
      }

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

        // sketch.image(blended, 0, 0, sketch.width, sketch.height)
        prevFrame.copy(sourceData, 0, 0, sketch.width, sketch.height, 0, 0, sketch.width, sketch.height)
      }

      function checkAreas (blendedData, blended) {
        blendedData.copy(blended, 0, 0, sketch.width, sketch.height, 0, 0, sketch.width, sketch.height)
        blendedData.loadPixels()

        var i = 0
        var average = 0
        // loop over the pixels
        let amount = 4
        while (i < (blendedData.pixels.length * 0.25)) {
          // make an average between the color channel
          average += (blendedData.pixels[i * amount] + blendedData.pixels[i * amount + 1] + blendedData.pixels[i * amount + 2]) / 3
          ++i
        }

        // calculate an average between of the color values of the note area
        average = Math.round(average / (blendedData.pixels.length * 0.25))

        if (average > 100 && !isSeen) {
          isSeen = true
          // Send the peers your preset
          send()
					resetPreset()
					
					// change colors 
					sketch.shuffle(chars, true)
					// init with random values
					for (var i = 0; i < sampleSize; i++) {
						hueValues[i] = sketch.random(360);
						saturationValues[i] = sketch.random(100);
						if (i % 15 == 0) {
							brightnessValues[i] = 0;
						} else {
							brightnessValues[i] = 100;
						}
						opacityValues[i] = sketch.random(255)
					}
        } else {
          if (isSeen) {
            isSeen = false
          }
        }
      }
    }

    new p5(s)
  }
}
