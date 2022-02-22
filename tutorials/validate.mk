
MM_SHELL ?= bash -c

validate:
	mm.py -l -s "${MM_SHELL}" README.md