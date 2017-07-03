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
  export EDITOR='subl -w'
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

export PATH="/usr/local/sbin:$PATH"
export PATH="$HOME/bin:$PATH"
export PATH="/usr/local/share/npm/bin:$PATH"
export PATH="/usr/local/opt/sqlite/bin:$PATH"
# export MANPATH="/usr/local/man:$MANPATH"

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# ssh
# export SSH_KEY_PATH="$HOME/.ssh/rsa_id"

# pip should only run if there is a virtualenv currently activated
export PIP_REQUIRE_VIRTUALENV=true

# use `gpip` to use global pip
gpip(){
   PIP_REQUIRE_VIRTUALENV="" pip "$@"
}

# Virtualenvwrapper setup
# export PROJECT_HOME=$HOME/repos

test -e ${HOME}/.iterm2_shell_integration.`basename $SHELL` && source ${HOME}/.iterm2_shell_integration.`basename $SHELL`
if which rbenv > /dev/null; then eval "$(rbenv init -)"; fi
export PATH="$HOME/.jenv/bin:$PATH"
eval "$(jenv init -)"
