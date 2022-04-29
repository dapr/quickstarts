
MM_SHELL ?= bash -c

all: install_mm validate

validate:
	mm.py -l -s "${MM_SHELL}" README.md

install_mm:
	type mm.py || sudo pip install mechanical-markdown
