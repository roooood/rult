import React from 'react';
import autoBind from 'react-autobind';
import { t } from '../../locales';
import play from '../Sound';

import Winwheel from './Winwheel';
import './Roulette.css';

window.playSound = function () {
  alert('ok')
}


class Roulette extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    }
    autoBind(this);
  }

  componentDidMount() {
    const { options } = this.props;
    let segments = [];
    for (let i in options) {
      segments.push({
        fillStyle: 'color' in options[i] ? options[i].color : this.getColor(i, options.length),
        text: 'title' in options[i] ? options[i].title : options[i].id,
      })
    }
    this.theWheel = new Winwheel({
      responsive: true,
      numSegments: options.length,
      textFontSize: 17,
      textMargin: 0,
      lineWidth: 0,
      segments: segments,
      textFontFamily: 'IRANSemi',
      strokeStyle: 'transparent',
      textAlignment: 'outer',
      textMargin: 30,
      // textStrokeStyle: '#000',
      textFillStyle: '#eee',
      textFontWeight: 'bold',
      animation:
      {
        type: 'spinToStop',
        duration: 3,
        spins: 3,
        callbackSound: this.playSound.bind(this),
        callbackFinished: this.alertPrize.bind(this),
      }
    });
  }
  alertPrize() {
    let winningSegment = this.theWheel.getIndicatedSegment();
    this.props.onComplete(winningSegment.text);
  }
  playSound() {
    play('tick');
    this.props.onTick();
  }
  byte2Hex(n) {
    const nybHexString = '0123456789ABCDEF';
    return String(nybHexString.substr((n >> 4) & 0x0F, 1)) + nybHexString.substr(n & 0x0F, 1);
  }

  RGB2Color(r, g, b) {
    return '#' + this.byte2Hex(r) + this.byte2Hex(g) + this.byte2Hex(b);
  }

  getColor(item, maxitem) {
    const phase = 0;
    const center = 128;
    const width = 128;
    const frequency = Math.PI * 2 / maxitem;

    const red = Math.sin(frequency * item + 2 + phase) * width + center;
    const green = Math.sin(frequency * item + 0 + phase) * width + center;
    const blue = Math.sin(frequency * item + 4 + phase) * width + center;

    return this.RGB2Color(red, green, blue);
  }
  spin(res) {
    const { options } = this.props;
    this.theWheel.stopAnimation(false);
    this.theWheel.rotationAngle = this.theWheel.rotationAngle % 360;
    let segmentNumber = null;
    for (let i in options) {
      if (options[i].id == res)
        segmentNumber = Number(i) + 1;
    }
    if (segmentNumber != null) {
      let stopAt = this.theWheel.getRandomForSegment(segmentNumber);
      this.theWheel.animation.stopAngle = stopAt;
      this.theWheel.startAnimation();
    }
  }


  render() {
    const { baseSize, size } = this.props;
    return (
      <div className="roulette" style={{ marginTop: Math.floor(baseSize / 11) }}>
        <div className="roulette-container">
          <div className="shadow" />
          <canvas
            id='canvas'
            width={baseSize * 2}
            height={baseSize * 2}
            data-responsiveMinWidth={180}
            data-responsiveScaleHeight={true}
            data-responsiveMargin={50}
            className="roulette-canvas"
          >
          </canvas>
        </div>
      </div>
    );
  }
}

export default Roulette;
