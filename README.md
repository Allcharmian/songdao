# songdao
Getting Started
To create a new NEAR project with default settings, you just need one command

Using npm's npx:

npx create-near-app [options] new-awesome-project
Or, if you prefer yarn:

yarn create near-app [options] new-awesome-project
Without any options, this will create a project with a vanilla JavaScript frontend and an AssemblyScript smart contract

Other options:

--frontend=react – use React for your frontend template
--contract=rust – use Rust for your smart contract
Develop your own Dapp
Follow the instructions in the README.md in the project you just created! 🚀

Getting Help
Check out our documentation or chat with us on Discord. We'd love to hear from you!

Contributing
To make changes to create-near-app itself:

clone the repository (Windows users, use git clone -c core.symlinks=true)
in your terminal, enter one of the folders inside templates, such as templates/vanilla
now you can run yarn to install dependencies and yarn dev to run the local development server, just like you can in a new app created with create-near-app
about commit messages
create-near-app uses semantic versioning and auto-generates nice release notes & a changelog all based off of the commits. We do this by enforcing Conventional Commits. In general the pattern mostly looks like this:

type(scope?): subject  #scope is optional; multiple scopes are supported (current delimiter options: "/", "\" and ",")
Real world examples can look like this:

chore: run tests with GitHub Actions

fix(server): send cors headers

feat(blog): add comment section
If your change should show up in release notes as a feature, use feat:. If it should show up as a fix, use fix:. Otherwise, you probably want refactor: or chore:. More info

Deploy
If you want to deploy a new version, you will need two prerequisites:

Get publish-access to the NPM package
Get write-access to the GitHub repository
Obtain a personal access token (it only needs the "repo" scope).
Make sure the token is available as an environment variable called GITHUB_TOKEN
Then run one script:

yarn release
Or just release-it
