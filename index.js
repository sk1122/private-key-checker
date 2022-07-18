#!/usr/bin/node

const { readdirSync, readFileSync } = require('fs')
const path = require('path')

const args = process.argv
let ignore_list = []
let found = false
//console.log(args[2])
const parentFolder = path.resolve(args[2])

for(let i = 0; i < args.length; i++) {
    if(found) ignore_list.push(path.resolve(args[i]))

    if(args[i] === '-L' || args[i] === '--list') {
       found = true;	
       continue;
    }
}
//console.log(ignore_list)

//const ignore_list = ['node_modules', '.git', '.next', 'lib', 'artifacts']
const ignore_file_list = ['yarn.lock', 'package-lock.json']

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)

const getFiles = source => 
    readdirSync(source, { withFileTypes: true })
	.filter(dirent => !dirent.isDirectory())
	.map(dirent => dirent)

let filesx = []
const getFilesDir = source => {
    const dirs = getDirectories(source)
    const files = getFiles(source)
 //   filesx.push(files.map(file => {
//	if(!ignore_file_list.find(dir => dir === file.name)) {
//	    console.log(`${source}/${file.name}`)
//	    return `${source}/${file.name}`
//	}
  //  }))
    const output_files = files.map(file => {
	if(!ignore_list.find(f => f === `${source}/${file.name}`)) return `${source}/${file.name}`
    })
    const o = output_files.filter(item => item)
    filesx.push(o)

    if(!dirs) return

    for(let i = 0; i < dirs.length; i++) {
	if(!ignore_list.find(dir => dir === `${source}/${dirs[i]}`)) getFilesDir(`${source}/${dirs[i]}`)
    }
}

getFilesDir(parentFolder)

//console.log(filesx)
const checkFile = (source, result) => {
    const filess = readFileSync(source, { encoding: 'utf-8' }).replace(/\s+/g, ' ').trim()
    const file = filess.split(" ")
//    console.log(source)
  //  console.log("\n")

    const pattern1 = /^0x[a-fA-F0-9]{64}$/
    const pattern2 = /^[a-fA-F0-9]{64}$/
    for(let i = 0; i < file.length; i++) {
	const text1 = file[i].replace(/"/g, "")
	const text = text1.replace(/'/g, '')
	const result1 = text.search(pattern1)
	const result2 = text.search(pattern2)

	if(result1 == 0 || result2 == 0) {
		result.push({ fileName: source, wordCount: i, length: file[i].length, string: text })
	}
    }
}

let result = []
//console.log(filesx)
filesx.reduce((acc, val) => acc.concat(val), []).map(file => checkFile(file, result))
console.log("Found Private Key at -> ", result)
