To be used with the stow command. To use this, pull and cd into the repo then run

```
stow --target=$HOME <list of folders>
```
Example:
```
stow --target=$HOME zsh nvim tmux
```
To undo if you mess up, from within the dotfiles folder:
```
stow -D <list of folders>
```
