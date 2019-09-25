import React, { Component } from 'react';
import autoBind from 'react-autobind';
import Roulette from './component/roulette/Roulette';
import { ToastsContainer, ToastsStore } from 'react-toasts';
import { getQuery } from './library/Helper';
import Bg from './assets/img/roulette.png';
import Center from './assets/img/center.png';
import Arrow from './assets/img/arrow.png';
import { t } from './locales';
import play from './component/Sound';
import ProgressButton from 'react-progress-button';
import "./assets/css/react-progress-button.css"
import './assets/css/app.css';
const api = window.location.protocol + '//localhost:2657/';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      size: null,
      route: 'loading',
      gift: 0,
      buttonState: ''
    };
    this.userKey = getQuery('token') || '-';
    this.go = true;
    autoBind(this);
  }
  componentDidMount() {
    this.getData();
    window.addEventListener("resize", this.onResize);
  }
  getData() {
    fetch(api + 'check/' + this.userKey, { method: 'GET' })
      .then(response => response.json())
      .then(res => {
        if ('result' in res) {
          this.setState({ ...res, route: 'game' }, () => {
            this.onResize();
          })

        }
        else {
          ToastsStore.error(t('networkError'), 8000);
        }
      });
  }
  gogoo(cb) {
    fetch(api + 'play/' + this.userKey, { method: 'GET' })
      .then(response => response.json())
      .then(res => {
        if ('result' in res) {
          if (res.result == 'ok') {
            this.gift = res.gift;
            cb('success', res.gift);
          }
          else if (res.result == 'no') {
            ToastsStore.error(t('nogift'), 8000);
            cb('error');
          }
          else {
            ToastsStore.error(t('userError'), 8000);
            cb('error');
          }
        }
        else {
          cb('error');
          ToastsStore.error(t('networkError'), 8000);
        }
      });
  }
  onResize() {
    this.setState({ size: null }, () => {
      let width = document.getElementById("roulette-img").clientWidth;
      let size = width < 360 ? 2.17 : 2.22;
      this.setState({ size: width / size });
    });
  }
  handleOnComplete(value) {
    this.go = true;
    if (this.gift != 0) {
      play('win');
      ToastsStore.success(t('win').replace('#', value), 8000);
    } else {
      play('lose');
      ToastsStore.error(t('lose'), 8000);
    }
  }
  onTick() {
    this.tick = this.tick++ || 0;
    let arrow = document.querySelector('.roulette-arrow');
    arrow.classList.remove('rotate');
    setTimeout(() => {
      arrow.classList.add('rotate')
    }, 2);
  }
  handleClick() {
    this.setState({ buttonState: 'loading' });
    if (this.go) {
      this.go = false;
      this.gogoo((type, res) => {
        this.setState({ buttonState: type });
        if (type == 'success') {
          this.roulette.spin(res);
        } else {
          this.go = true;
        }
      })
    } else {
      this.setState({ buttonState: 'error' });
    }
  }
  goto(path) {
    let back = getQuery('ref');
    if (back)
      window.location = back + "/" + path
  }
  render() {
    if (this.state.route == 'loading')
      return (
        <div class="cell">
          <div class="loader">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
      )
    return (
      <div id="roulette" >
        <ToastsContainer store={ToastsStore} />
        <div className="roulette-dir" >
          <img id="roulette-img" src={Bg} className="roulette-img" />
          {this.state.size > 0 &&
            <Roulette
              options={this.state.gifts}
              baseSize={this.state.size}
              onComplete={this.handleOnComplete}
              onTick={this.onTick}
              ref={(ref) => this.roulette = ref}
            />
          }
          <div className="roulette-center" >
            <div style={{ position: 'relative', width: '100%', height: '100%' }} >
              <div className="center-shadow" />
              <img src={Center} style={{ width: '100%' }} />
            </div>
          </div>
          <img src={Arrow} className="roulette-arrow" />
        </div>
        <div className="roulette-container">
          {'id' in this.state
            ? <ProgressButton ref={(ref) => this.loading = ref} onClick={this.handleClick} state={this.state.buttonState}>
              {t('go')}
            </ProgressButton>
            : <div className="pb-container" >
              <button type="button" className="btn success" onClick={() => this.goto('register')} >{t('signUp')}</button>
              <button type="button" className="btn error" onClick={() => this.goto('auth')} >{t('signIn')}</button>
            </div>
          }
        </div>
      </div>
    );
  }
}

export default App;
