const title = 'イカボード';

const stages = [ {
		name: 'ハコフグ倉庫',
		value: 'hakohugu'
	}, {
		name: 'シオノメ油田',
		value: 'sionome'
	}, {
		name: 'Bバスパーク',
		value: 'blackbass'
	}, {
		name: 'アロワナモール',
		value: 'arowana'
	}, {
		name: 'デカライン高架下',
		value: 'dekaline'
	}, {
		name: 'ホッケ埠頭',
		value: 'hokke'
	}, {
		name: 'モズク農園',
		value: 'mozuku'
	}, {
		name: 'ネギトロ炭鉱',
		value: 'negitoro'
	}, {
		name: 'タチウオパーキング',
		value: 'tachiuo'
	}, {
		name: 'モンガラキャンプ場',
		value: 'mongara'
	}, {
		name: 'ヒラメが丘団地',
		value: 'hirame'
	}
]

const modes = [ {
		name: 'ナワバリバトル',
		value: 'nawabari'
	}, {
		name: 'ガチエリア',
		value: 'area'
	}, {
		name: 'ガチヤグラ',
		value: 'yagura'
	}, {
		name: 'ガチホコバトル',
		value: 'gachihoko'
	}
]

const colors = [
	'#728626', '#6c2489', '#077385', '#c2505c', '#222a94',
	'#ca632c', '#d65780', '#ea8f19', '#33379e', '#849b1b',
	'#dc6d2c', '#26767b', '#428944', '#c25779', '#83367d',
	'#5b974b', '#4666de', '#7dcf7c', '#6da030', '#a04883',
	'#503ba0', '#d88b25', '#63a594', '#9051ae', '#bb5233',
	'#368470', '#1b2765', '#af7a28'
]

const widths = [ {
		name: '細',
		value: 4,
		src: '/images/linewidth/small.png'
	}, {
		name: '中',
		value: 6,
		src: '/images/linewidth/mid.png'
	}, {
		name: '太',
		value: 8,
		src: '/images/linewidth/large.png'
	}
]

const stamps = [ {
		value: 'beacon-gamepad',
		src: '/images/stamp/png/beacon-gamepad.png'
	}, {
		value: 'beacon-real',
		src: '/images/stamp/png/beacon-real.png'
	}
]

exports.new = function() {
	return {
		title: title,
		stages: stages,
		modes: modes,
		colors: colors,
		widths: widths,
		stamps: stamps
	};
};

