import React, { createContext, Component } from 'react';
import { NativeModules } from 'react-native';

const { AudioModule } = NativeModules;

const MetronomeContext = createContext();

class MetronomeProvider extends Component {
	constructor(props) {
		super(props);
		this.state = {
			bpm: 120,
			playing: false,
			count: 0,
			beatsPerCycle: 8,
			currentBeat: 0,
			firstCycle: true,
			soundOn: true,
			countDown: true,
			totalBeats: 0,
		};

		this.click1 = 'click1';
		this.click2 = 'click1';

		this.handleBPM = this.handleBPM.bind(this);
		this.updateInterval = this.updateInterval.bind(this);
		this.startStop = this.startStop.bind(this);
		this.playClick = this.playClick.bind(this);
		this.handleBeatsChange = this.handleBeatsChange.bind(this);
		this.toggleSound = this.toggleSound.bind(this);
		this.toggleCountDown = this.toggleCountDown.bind(this);
	}

	updateInterval() {
		const bpmSpeed = (60 * 1000) / this.state.bpm;
		this.timer = setInterval(this.playClick, bpmSpeed);
	}

	handleBPM(value) {
		const bpm = value;
		if (this.state.playing) {
			clearInterval(this.timer);
			this.updateInterval();
			this.setState({
				count: 0,
				bpm,
			});
		} else {
			this.setState({
				bpm,
			});
		}
	}

	handleBeatsChange(value) {
		const beatsPerCycle = parseInt(value, 10) || 1;
		this.setState({
			beatsPerCycle,
			count: 0,
		});
	}

	playClick() {
		const { count, beatsPerCycle, firstCycle, soundOn, countDown, totalBeats } = this.state;

		let currentBeat = countDown ? (firstCycle ? beatsPerCycle - count : count + 1) : count + 1;
		if (totalBeats === beatsPerCycle) {
			currentBeat = 1;
		}
		this.setState({
			currentBeat,
		});

		if (soundOn && AudioModule) {
			if (count % beatsPerCycle === 0) {
				AudioModule.playAudio(this.click1)
					.then(() => {
						if (count + 1 >= beatsPerCycle && firstCycle) {
							this.setState({ firstCycle: false });
						}
					})
					.catch((error) => console.error('Error playing audio:', error));
			} else {
				AudioModule.playAudio(this.click2)
					.then(() => {
						if (count + 1 >= beatsPerCycle && firstCycle) {
							this.setState({ firstCycle: false });
						}
					})
					.catch((error) => console.error('Error playing audio:', error));
			}
		}

		this.setState({
			count: (count + 1) % beatsPerCycle,
			totalBeats: totalBeats + 1,
		});
	}

	startStop() {
		console.log("---------------------------------------------");
		if (this.state.playing && AudioModule) {
			clearInterval(this.timer);
			AudioModule.stopAudio()
				.then(() => {
					this.setState({
						totalBeats: 0,
						count: 0,
						currentBeat: 0,
						playing: false,
						firstCycle: true,
					});
				})
				.catch((error) => console.error('Error stopping audio:', error));
		} else {
			this.updateInterval();
			this.setState(
				{
					totalBeats: 0,
					count: 0,
					currentBeat: 0,
					playing: true,
					firstCycle: true,
				},
				this.playClick
			);
		}
	}

	toggleSound() {
		this.setState((prevState) => ({
			soundOn: !prevState.soundOn,
		}));
	}

	toggleCountDown() {
		this.setState((prevState) => ({
			countDown: !prevState.countDown,
		}));
	}

	render() {
		return (
			<MetronomeContext.Provider
				value={{
					...this.state,
					handleBPM: this.handleBPM,
					startStop: this.startStop,
					handleBeatsChange: this.handleBeatsChange,
					toggleSound: this.toggleSound,
					playClick: this.playClick,
					toggleCountDown: this.toggleCountDown,
				}}
			>
				{this.props.children}
			</MetronomeContext.Provider>
		);
	}
}

export { MetronomeProvider, MetronomeContext };