#!/usr/bin/env node
/**
 * JIRA ID Commit Stamper
 * @author john.farrow@nationwide.co.uk
 *
 * Depends on your branch strategy including the JIRA ticket ID in your branch names.
 *
 * - Update `ticketPattern` to match the ID's of your project
 * - Save to `.git/hooks/prepare-commit-msg`
 * - Run chmod a+x `.git/hooks/prepare-commit-msg`
 */
const ticketPattern = /rio-(\d+)/;


const { exec } = require('child_process');
const { readFile, writeFile, exists } = require('fs');
const process = require('process');

function getBranch() {
    return new Promise((res, rej) => {
        exec('git symbolic-ref --short HEAD', (err, stdout) => res(stdout.toString()));
    });
}

function readFilePromise(name) {
  return new Promise((res, rej) => {
    readFile(name, 'utf8', (err, n) => res(n.trim()))
  })
}
function commit(file, msg) {
    return new Promise((res) => {
        const buffer = new Buffer(`${msg}\n`, 'utf8');
        writeFile(file, `${msg}\n`, res);
    });
}

async function main() {
    const branch = await getBranch();
    const ticket = ticketPattern.test(branch) ? branch.match(ticketPattern)[0] : '';
    const msg = await readFilePromise(process.argv[2]);
    const msgHasTicket = msg.includes(ticket);
    if (!!ticket && !msgHasTicket) {
        console.log('Added JIRA Ticket ID to commit msg');
        await commit(process.argv[2], `[${ticket.toUpperCase()}] ${msg}`);
    } else {
        await commit(process.argv[2], msg);
    }
    process.exit(0);
}

main();
