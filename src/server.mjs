import express from 'express';
import { exec } from 'child_process';
import net from 'net';
import {runChain} from "./app.mjs";

const app = express();

function findAvailablePort(startingFrom, callback) {
    const port = startingFrom;
    const server = net.createServer();

    server.listen(port, () => {
        server.once('close', () => {
            callback(port);
        });
        server.close();
    });

    server.on('error', () => {
        findAvailablePort(port + 1, callback);
    });
}

findAvailablePort(3000, (port) => {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);

        exec('git diff --cached --name-only', async (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }

            const files = stdout.split('\n').filter(Boolean);
            try {
                const report = await runChain(files);
                console.log("Analysis Result: \n" + report);
            } catch (err) {
                console.error("Error generating report: ", err);
            }

            process.exit(0);
        });
    });
});
