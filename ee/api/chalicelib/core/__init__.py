from decouple import config
import logging

logging.basicConfig(level=config("LOGLEVEL", default=logging.INFO))

if config("EXP_SESSIONS_SEARCH", cast=bool, default=False):
    print(">>> Using experimental sessions search")
    from . import sessions_exp as sessions
else:
    from . import sessions as sessions

if config("EXP_AUTOCOMPLETE", cast=bool, default=False):
    print(">>> Using experimental autocomplete")
    from . import autocomplete_exp as autocomplete
else:
    from . import autocomplete as autocomplete

if config("EXP_ERRORS_SEARCH", cast=bool, default=False):
    print(">>> Using experimental error search")
    from . import errors_exp as errors
else:
    from . import errors as errors

if config("EXP_METRICS", cast=bool, default=False):
    print(">>> Using experimental metrics")
    from . import metrics_exp as metrics
else:
    from . import metrics as metrics
