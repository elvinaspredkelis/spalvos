# Spalvos for fish — load the light or dark theme to match the desktop mode.
#
# Install as ~/.config/fish/conf.d/spalvos-theme.fish, alongside
# spalvos-{light,dark}.theme in ~/.config/fish/themes/.
#
# IMPORTANT — this REPLACES ~/.config/fish/conf.d/fish_frozen_theme.fish, which
# fish 4.3 generates to migrate its default theme from universal to global
# scope. Delete that file when installing this one. Both cannot coexist:
# whichever conf.d snippet sorts LAST wins, and the frozen file's `set --global`
# also shadows any universal variable that `fish_config theme choose` writes.
# That shadowing is why picking a theme in the web config appeared to do
# nothing. (The frozen file's own header says to delete it to customise.)
#
# The .theme files are the single source of truth — this script only parses and
# applies them, so a colour never lives in two places.

function __spalvos_mode --description 'light or dark, following the desktop'
    # Omarchy drops a `light.mode` marker into the active theme directory, and
    # that is the same signal ghostty follows (omarchy-theme-set writes the GTK
    # color-scheme at the same time). Prefer it: it is a stat, not a subprocess.
    if test -f "$HOME/.config/omarchy/current/theme/light.mode"
        echo light
        return
    else if test -d "$HOME/.config/omarchy/current/theme"
        echo dark
        return
    end

    # No omarchy: fall back to the GTK preference, then to dark.
    if command -q gsettings
        if string match -q '*light*' -- (gsettings get org.gnome.desktop.interface color-scheme 2>/dev/null)
            echo light
            return
        end
    end
    echo dark
end

function __spalvos_load_theme --description 'apply a fish .theme file as globals'
    set -l file $argv[1]
    test -r "$file"; or return 1

    while read -l line
        # Strip comments and blank lines.
        set line (string replace -r '#.*$' '' -- $line | string trim)
        test -n "$line"; or continue

        # `name value...` — everything after the name is the colour spec, which
        # may carry several tokens (`343331 --background=cbf2f4`).
        set -l parts (string split -n ' ' -- $line)
        set -q parts[2]; or continue

        # Only ever touch fish's own colour variables.
        string match -qr '^fish_(color|pager_color)_' -- $parts[1]; or continue

        set -g $parts[1] $parts[2..-1]
    end <"$file"
end

# Applied unconditionally, exactly as the fish_frozen_theme.fish it replaces
# did. Deliberately NOT gated on `status is-interactive`: `exit` inside a
# sourced conf.d file terminates startup and would skip every snippet that
# sorts after this one, and `set` on a couple of dozen variables is cheaper
# than the guard is worth.
set -l __spalvos_variant (__spalvos_mode)
__spalvos_load_theme "$HOME/.config/fish/themes/spalvos-$__spalvos_variant.theme"

# --- Tide prompt ----------------------------------------------------------
# Tide stores its colours as universal variables holding ANSI slot NAMES. Most
# are fine — a name like `green` resolves through ghostty's spalvos palette. The
# ones below are not, because they name slots that spalvos uses for SURFACES
# rather than ink, and they break in opposite modes:
#
#   white / brwhite  = paper-sunken / paper-raised in spalvos-light, so the OS
#                      icon, bun, crystal and private-mode segments rendered at
#                      ~1.04:1 on paper — invisible.
#   brblack          = neutral-700 in spalvos-dark, 1.73:1 on the background, so
#                      the frame, separators, timestamps and command durations
#                      all but vanished.
#
# Only those are repointed, to explicit hex, per mode. Everything else keeps its
# ANSI name and tracks the terminal theme for free.
if test "$__spalvos_variant" = light
    set -g tide_os_color 343331 # neutral-800 — same ink as the terminal fg
    set -g tide_bun_color 343331
    set -g tide_crystal_color 343331
    set -g tide_private_mode_color 343331
    set -g tide_vi_mode_color_default 41403d # neutral-700
    set -g tide_cmd_duration_color 73716e # neutral-500
    set -g tide_time_color 73716e
    # Frame and separators are line art, deliberately below text weight —
    # decorative (~2:1), but no longer the 1.04:1 that made them disappear.
    set -g tide_prompt_color_frame_and_connection b5b4b1 # neutral-300
    set -g tide_prompt_color_separator_same_color b5b4b1
else
    set -g tide_os_color ecebe9 # neutral-100 — same ink as the terminal fg
    set -g tide_bun_color ecebe9
    set -g tide_crystal_color ecebe9
    set -g tide_private_mode_color ecebe9
    set -g tide_vi_mode_color_default d5d4d2 # neutral-200
    set -g tide_cmd_duration_color 908f8c # neutral-400
    set -g tide_time_color 908f8c
    set -g tide_prompt_color_frame_and_connection 565552 # neutral-600
    set -g tide_prompt_color_separator_same_color 565552
end

functions -e __spalvos_mode __spalvos_load_theme
