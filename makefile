.DEFAULT_GOAL := all
FLAGS= --lib es5,es6,dom

all: compileTS

#compile typescript files
compileTS: ts/script.ts
	tsc ts/script.ts --outDir js $(FLAGS)

#Clean
clean:
	rm -rf js
