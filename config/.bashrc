#
# ~/.bashrc
#


# If not running interactively, don't do anything
[[ $- != *i* ]] && return


alias ..='cd ..'
alias ping='ping 8.8.8.8'
alias restart='sudo pacman -Syu --noconfirm && sudo reboot'
alias ls='echo " " && ls -CF && echo " "'


alias mem='free -h'
alias cpu='lscpu'
alias disk='df -hT'

PS1='\u\[\e[3m\]@\[\e[0m\]\H \W\n╰┈➤  '
