set nocompatible              " Disable vi compatibility
set encoding=utf-8            " Use UTF-8 encoding
set fileencoding=utf-8
set backspace=indent,eol,start " Make backspace work as expected
set history=1000              " Command history
set undolevels=1000           " Undo history
set autoread                  " Reload files changed outside vim
set hidden                    " Allow hidden buffers
set updatetime=300            " Faster completion
set timeoutlen=500            " Faster key sequence completion
set ttyfast                   " Faster redrawing
set lazyredraw                " Don't redraw while executing macros

" Interface
set number                    " Show line numbers
set relativenumber            " Relative line numbers
set showmatch                 " Highlight matching brackets
set matchtime=2               " Tenths of a second to show match
set wildmenu                  " Visual autocomplete for command menu
set wildmode=longest:full,full
set ruler                     " Show cursor position

" Indentation
set expandtab                 " Use spaces instead of tabs
set tabstop=4                 " Tab width
set shiftwidth=4              " Indent width
set softtabstop=4             " Soft tab width
set autoindent                " Auto indent
set smartindent               " Smart indent
set wrap                      " Wrap lines
set linebreak                 " Wrap at word boundaries

" Files and Backups
set nobackup                  " No backup files
set nowritebackup
set noswapfile                " No swap files
set autowrite                 " Auto save before commands like :next
set autowriteall              " Auto save on various commands

" Folding
set foldmethod=indent         " Fold based on indent
set foldnestmax=3             " Maximum fold depth
set nofoldenable              " Don't fold by default
set foldlevelstart=99         " Start with all folds open

" Performance
set synmaxcol=200             " Syntax highlighting column limit
syntax sync minlines=256      " Syntax sync for performance

" Enable syntax and filetype detection
syntax enable
filetype plugin indent on

