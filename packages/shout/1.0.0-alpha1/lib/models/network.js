var _ = require("lodash");
var Chan = require("./chan");

module.exports = Network;

function Network(attr) {
	_.merge(this, _.extend({
		id: global.id = ++global.id || 1,
		client: null,
		host: "",
		nick: "",
		channels: [],
	}, attr));
	
	// Add lobby
	this.channels.unshift(
		new Chan({name: this.host, type: "lobby"})
	);
};

Network.prototype = {
	toJSON: function() {
		return _.omit(this, "client");
	}
};
