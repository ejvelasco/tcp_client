process.stdin
	.on("readable", () => {
		let chunk;
		console.log("New data available.");
		while( (chunk = process.stdin.read()) !== null ){
			console.log(chunk.toString());
		}
	})
	.on("end", () => {
		process.stdout.write("End of stream");
	});