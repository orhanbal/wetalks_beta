cat << 'INNER_EOF' >> src/index.css
/* Premium Contrast Safety Overrides for polluted Zinc text classes */
.text-zinc-800 {
  color: var(--zinc-700, #49454F) !important;
}
.dark .text-zinc-800,
.dark .dark\:text-zinc-800 {
  color: var(--zinc-550, #E3E3E3) !important;
}

.text-zinc-850 {
  color: var(--zinc-900, #CAC4D0) !important;
}
.dark .text-zinc-850,
.dark .dark\:text-zinc-850 {
  color: var(--zinc-550, #E3E3E3) !important;
}

.dark .text-zinc-100,
.dark .dark\:text-zinc-100,
.dark .hover\:text-zinc-100:hover,
.dark .dark\:hover\:text-zinc-100:hover {
  color: var(--zinc-900, #F1F5F9) !important;
}

.dark .text-zinc-200,
.dark .dark\:text-zinc-200,
.dark .hover\:text-zinc-200:hover,
.dark .dark\:hover\:text-zinc-200:hover {
  color: var(--zinc-700, #CBD5E1) !important;
}

.dark .text-zinc-250,
.dark .dark\:text-zinc-250,
.dark .hover\:text-zinc-250:hover,
.dark .dark\:hover\:text-zinc-250:hover {
  color: var(--zinc-700, #CBD5E1) !important;
}

.dark .text-zinc-50,
.dark .dark\:text-zinc-50,
.dark .hover\:text-zinc-50:hover,
.dark .dark\:hover\:text-zinc-50:hover {
  color: var(--zinc-950, #FFFFFF) !important;
}

/* Background overrides for dark mode to resolve the inverted variable collisions */
.dark .bg-white,
.dark .dark\:bg-white {
  background-color: #111424 !important;
}

.dark .bg-zinc-100,
.dark .dark\:bg-zinc-100 {
  background-color: #0b0e1b !important;
}

.dark .bg-zinc-50,
.dark .dark\:bg-zinc-50 {
  background-color: #070913 !important;
}

.dark .bg-zinc-900,
.dark .dark\:bg-zinc-900 {
  background-color: #0b0e1b !important;
}

.dark .bg-zinc-950,
.dark .dark\:bg-zinc-950 {
  background-color: #070913 !important;
}

.dark .bg-zinc-850,
.dark .dark\:bg-zinc-850 {
  background-color: rgba(20, 24, 45, 0.72) !important;
}

.dark .bg-zinc-800,
.dark .dark\:bg-zinc-800 {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.dark .bg-zinc-50\/50,
.dark .dark\:bg-zinc-50\/50 {
  background-color: rgba(7, 9, 19, 0.5) !important;
}

.dark .bg-zinc-50\/20,
.dark .dark\:bg-zinc-50\/20 {
  background-color: rgba(7, 9, 19, 0.2) !important;
}
INNER_EOF
