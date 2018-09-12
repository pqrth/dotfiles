# For sudo-ing aliases
# https://wiki.archlinux.org/index.php/Sudo#Passing_aliases
alias sudo='sudo '

# Ensure languages are set
export LANG=en_GB.UTF-8
export LANGUAGE=en_GB.UTF-8
export LC_ALL=en_GB.UTF-8

# Secrets
test -f $HOME/.secret && source $HOME/.secret

# Preferred editor for local and remote sessions
if [[ -n $SSH_CONNECTION ]]; then
  export EDITOR='vi'
else
  export EDITOR='subl'
fi

#
# OS Detection
#

UNAME=`uname`

# Fallback info
CURRENT_OS='Linux'
DISTRO=''

if [[ $UNAME == 'Darwin' ]]; then
    CURRENT_OS='OS X'
else
    # Must be Linux, determine distro
    if [[ -f /etc/redhat-release ]]; then
        # CentOS or Redhat?
        if grep -q "CentOS" /etc/redhat-release; then
            DISTRO='CentOS'
        else
            DISTRO='RHEL'
        fi
    fi
fi

# Use zsh-completions if it exists
if [[ -d "/usr/local/share/zsh-completions" ]]; then
    fpath=(/usr/local/share/zsh-completions $fpath)
fi

#
# Setup environment variables
#

# PATH setup
export PATH="/usr/local/sbin:$PATH"
export PATH="$HOME/bin:$PATH"
export PATH="/usr/local/share/npm/bin:$PATH"
export PATH="/usr/local/opt/sqlite/bin:$PATH"
COREUTILS_PATH=$(brew --prefix coreutils)
export PATH="$COREUTILS_PATH/libexec/gnubin:/usr/local/bin:$PATH"
export MANPATH="$COREUTILS_PATH/libexec/gnuman:$MANPATH"

# Adds erlang's man pages
export MANPATH=/usr/local/opt/erlang/lib/erlang/man:$MANPATH

# Environment Switching setup
export RBENV_ROOT=$HOME/.rbenv
export PYENV_ROOT=$HOME/.pyenv

#
# Antigen
#

# Antigen Plugins' Config
# Load before loading Antigen for the cached bundles in its init
test -f $HOME/.oh-my-zsh && source $HOME/.oh-my-zsh
test -f $HOME/.powerlevel9k && source $HOME/.powerlevel9k

# Load Antigen
ANTIGEN=/usr/local/share/antigen
source $ANTIGEN/antigen.zsh

# Antigen init
antigen init $HOME/.antigenrc

# User configuration

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# ssh
# export SSH_KEY_PATH="$HOME/.ssh/rsa_id"

init_env(){
  # expects to be called as: init_env pyenv
  if which $1 > /dev/null
  then eval "$($1 init -)"
  fi
}
init_env jenv
init_env goenv

# pip should only run if there is a virtualenv currently activated
export PIP_REQUIRE_VIRTUALENV=true

# use `gpip` to use global pip
gpip(){
   PIP_REQUIRE_VIRTUALENV="" pip "$@"
}

test -e ${HOME}/.iterm2_shell_integration.`basename $SHELL` && source ${HOME}/.iterm2_shell_integration.`basename $SHELL`
