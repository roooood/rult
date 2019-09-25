import React from 'react';
import PropTypes from 'prop-types';
import ProgressButton from 'react-progress-button';
import "react-progress-button/react-progress-button.css"
import './Roulette.css';
import { t } from '../../locales';
import play from '../Sound';


class Roulette extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spinAngleStart: 0,
      startAngle: 0,
      spinTime: 0,
      buttonState: '',
      arc: Math.PI / (props.options.length / 2),
    }
    this.spinTimer = null;
    this.handleClick = this.handleClick.bind(this);
    this.spin = this.spin.bind(this);
    this.rotate = this.rotate.bind(this);
  }

  static propTypes = {
    className: PropTypes.string,
    options: PropTypes.array,
    baseSize: PropTypes.number,
    spinAngleStart: PropTypes.number,
    spinTimeTotal: PropTypes.number,
    onComplete: PropTypes.func,
  };

  static defaultProps = {
    options: [{ id: 'test' }],
    baseSize: 275,
    spinAngleStart: Math.random() * 10 + 10,
    spinTimeTotal: Math.random() * 3 + 4 * 1000,
  };

  componentDidMount() {
    this.drawRouletteWheel();
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

  drawRouletteWheel() {
    const { options, baseSize } = this.props;
    let { startAngle, arc } = this.state;


    // const spinTimeout = null;
    // const spinTime = 0;
    // const spinTimeTotal = 0;

    let ctx;

    const canvas = this.refs.canvas;
    if (canvas.getContext) {
      const outsideRadius = baseSize - 25;
      const textRadius = baseSize / 4;//baseSize - 45;
      const insideRadius = baseSize - 55;

      ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 600, 600);

      ctx.font = '13px IRANSemi';

      for (let i = 0; i < options.length; i++) {
        const angle = startAngle + i * arc;

        ctx.shadowBlur = 5;
        ctx.shadowColor = "black";
        ctx.beginPath();
        ctx.fillStyle = 'color' in options[i] ? options[i].color : this.getColor(i, options.length);
        ctx.moveTo(baseSize, baseSize);
        ctx.arc(baseSize, baseSize, outsideRadius, angle, angle + arc, false);
        ctx.closePath();
        ctx.fill();
        ctx.save();

        ctx.translate(baseSize + Math.cos(angle + arc / 2) * textRadius, (baseSize + Math.sin(angle + arc / 3) * textRadius));
        ctx.fillStyle = "#fff";
        ctx.font = outsideRadius / 10 + "px IRANSemi";
        ctx.rotate(angle + arc / 2);
        var labelText = 'title' in options[i] ? options[i].title : options[i].id;
        ctx.fillText(labelText, ctx.measureText(labelText).width / 2, 10);
        ctx.restore();
      }
    }
  }

  spin(point) {
    this.spinTimer = null;
    this.setState({ spinTime: 0, point }, () => this.rotate());
  }

  rotate() {
    const { spinAngleStart, spinTimeTotal } = this.props;
    if (this.state.spinTime > 2800) {
      clearTimeout(this.spinTimer);
      this.stopRotateWheel();
    } else {
      console.log('====================================');
      console.log(this.state.startAngle);
      console.log('====================================');
      const spinAngle = spinAngleStart - this.easeOut(this.state.spinTime, 0, spinAngleStart, spinTimeTotal);
      this.setState({
        startAngle: this.state.startAngle + spinAngle * Math.PI / 180,
        spinTime: this.state.spinTime + 20,
      }, () => {
        this.drawRouletteWheel();
        clearTimeout(this.spinTimer);
        this.spinTimer = setTimeout(() => this.rotate(), 20);
      })
    }
  }

  stopRotateWheel() {
    let { startAngle, arc } = this.state;
    const { options, baseSize } = this.props;

    const degrees = startAngle * 180 / Math.PI + 90;
    const arcd = arc * 180 / Math.PI;
    const index = Math.floor((360 - degrees % 360) / arcd);
    const text = 'title' in options[index] ? options[index].title : options[index].id;
    this.props.onComplete(text);
  }

  easeOut(t, b, c, d) {
    const ts = (t /= d) * t;
    const tc = ts * t;
    return b + c * (tc + -3 * ts + 3 * t);
  }

  handleClick() {
    this.setState({ buttonState: 'loading' });
    this.props.onClick((type, res) => {
      this.setState({ buttonState: type });
      if (type == 'success') {
        this.spin(res);
        play('wheel')
      }
    })

  }

  render() {
    const { baseSize, size } = this.props;
    return (
      <div className="roulette" style={{ marginTop: -9 - ((3.05 - size) * 35) }}>
        <div className="roulette-container">
          <canvas ref="canvas" width={baseSize * 2} height={baseSize * 2} className="roulette-canvas"></canvas>
        </div>
        <div className="roulette-container">
          <ProgressButton onClick={this.handleClick} state={this.state.buttonState}>
            {t('go')}
          </ProgressButton>
        </div>
      </div>
    );
  }
}

export default Roulette;
