# If This Than Ad (Trigger Based Marketing)

## Development

### Git: Pre commit
To do all the checks before the commit automatically please add the [git/pre-commit](git/pre-commit) to your `.git/hooks/` directory. The easiest way would be to create a soft link: `cd .git/hooks/; ln -sf ../../git/pre-commit`.

To run all checks manually you can execute the following code from the project root:
- For server: `cd server; npm run pre-commit`.
- For client: `cd cleint; npm run pre-commit`.
