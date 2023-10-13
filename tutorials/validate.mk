MM_SHELL ?= bash -c


validate:
	mm.py -l -s "${MM_SHELL}" README.md

validate_normal_run:
	mm.py -t normal-run -l -s "${MM_SHELL}" README.md

validate_multi_app_run:
	mm.py -t multi-app -s "${MM_SHELL}" README.md