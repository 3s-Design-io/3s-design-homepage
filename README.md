# 3s Design

The static portfolio includes 129 projects and their galleries. GitHub Pages serves the `docs/` folder from `main`.

- `docs/project/` contains the project pages.
- `docs/assets/` contains the styles, scripts, fonts, and published media.
- `tests/` checks the project index, theme preference, and local links.

Run the checks with `node --test tests/*.test.cjs`. To preview locally, run `python serve.py --bind 127.0.0.1` and open `http://localhost:8765/`.
