.DEFAULT_GOAL := all
FLAGS= --lib es5,es6,dom

all: compileTS

#compile typescript files
compileTS: frontend/ts/script.ts
	tsc frontend/ts/script.ts --outDir frontend/js $(FLAGS)

#Clean
clean:
	rm -rf frontend/js