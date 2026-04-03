import { CommonModule } from '@angular/common';
import {
    AfterViewInit,
    Component,
    ElementRef,
    OnDestroy,
    QueryList,
    ViewChildren
} from '@angular/core';
import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';

type TimelineEntry = {
    date: string;
    body: string;
};

type FloatingParticle = {
    left: number;
    size: number;
    duration: number;
    delay: number;
};

type FloatingEmoji = {
    left: number;
    size: number;
    duration: number;
    delay: number;
    drift: number;
    opacity: number;
    symbol: string;
};

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    animations: [
        trigger('fadeInUp', [
            state(
                'hidden',
                style({
                    opacity: 0,
                    transform: 'translateY(30px)'
                })
            ),
            state(
                'visible',
                style({
                    opacity: 1,
                    transform: 'translateY(0)'
                })
            ),
            transition('hidden => visible', [
                animate(
                    '{{duration}} {{delay}} cubic-bezier(0.22, 1, 0.36, 1)'
                )
            ], {
                params: {
                    duration: '1000ms',
                    delay: '0ms'
                }
            })
        ]),
        trigger('slideIn', [
            state(
                'hidden',
                style({
                    opacity: 0,
                    transform: 'translateX({{offset}}px) translateY(18px)'
                }),
                {
                    params: {
                        offset: 50
                    }
                }
            ),
            state(
                'visible',
                style({
                    opacity: 1,
                    transform: 'translateX(0) translateY(0)'
                })
            ),
            transition('hidden => visible', [
                animate('950ms cubic-bezier(0.22, 1, 0.36, 1)')
            ])
        ]),
        trigger('fadeSequential', [
            state('hidden', style({ opacity: 0, transform: 'translateY(18px)' })),
            state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
            transition('hidden => visible', [
                animate('900ms {{delay}} cubic-bezier(0.22, 1, 0.36, 1)')
            ], {
                params: {
                    delay: '0ms'
                }
            })
        ])
    ]
})
export class AppComponent implements AfterViewInit, OnDestroy {
    @ViewChildren('timelineCard', { read: ElementRef })
    private timelineCardRefs!: QueryList<ElementRef<HTMLElement>>;

    @ViewChildren('confessionParagraph', { read: ElementRef })
    private confessionParagraphRefs!: QueryList<ElementRef<HTMLElement>>;

    @ViewChildren('questionParagraph', { read: ElementRef })
    private questionParagraphRefs!: QueryList<ElementRef<HTMLElement>>;

    heroReady = false;
    countdownLabel = '';
    pageExpired = false;

    timelineEntries: TimelineEntry[] = [
        {
            date: 'October 4, 2025 — ~6:30 PM',
            body: "The first time I saw you. Your relatives were visiting, you were near the housing complex with a colleague and an elderly lady. You were wearing a maroon top and skin-coloured bottom. I had come just to pick up a parcel and leave. But the moment I saw you, something shifted — and instead of leaving, I walked inside the campus. I didn't analyse it then. I just did it."
        },
        {
            date: 'November 28, 2025 — 6:10 PM',
            body: "Outside the main entrance, waiting for the bus. When the bus came, people started forming a line. I joined it. And then I saw you — in a black top and the same skin-coloured jeans from the first day. The moment I saw you, I felt something I had never felt before. Something I didn't have a word for. I normally avoid speaking to women I don't know. But that evening I felt a genuine urge to talk to you — not out of impulse, but out of something deeper I still can't fully explain. That same evening I called a friend and told him about it. Asked him and his girlfriend for their perspective. That is not something I do. Ever. Nobody told me about you. Nobody pointed you out. It was entirely on its own."
        },
        {
            date: 'December 15, 2025 — Return to TIFR',
            body: "I had gone to Pune for a couple of weeks. When I came back, the feeling was still there — exactly as it was. So I started taking the 6:15 bus every day, just to see you. On the days I saw you, something settled inside me. On the days I didn't, I felt restless without knowing why. Eventually I approached you and started a conversation in person. That is not something I do easily. But with you, it felt like something I had to do."
        },
        {
            date: 'January to March 2026',
            body: "The more I saw you, the more I found you beautiful. Not just how you look — but how I feel in those moments. You are the first person after seeing whom I feel at ease. Genuinely at ease. The first person after seeing whom I want to be better — more disciplined, stronger, more present, the person I would like to keep and protect. There were silences. There were gaps. There were moments of real pain — the kind I hadn't felt before. The first time in my life I felt a fear of losing someone. I saw you on Gudi Padwa. Still found you beautiful, in whatever you were wearing that day. And I felt better again. That told me something."
        }
    ];

    confessionParagraphs: string[] = [
        "I know you said friends only. I respected that, and I'm not writing this to pressure you or guilt you into anything.",
        "I'm writing this because I'd rather say it clearly, once, and know where I stand — than keep carrying it quietly and wonder.",
        "I'm not rich. I don't have a car or bike yet. I'm a normal person working hard every day toward something bigger. But I'm someone who means exactly what he says. Someone who notices things. Someone who has been paying attention to you since October — not because someone told him to, but because something in him just did.",
        "I want you to know that I’m rooting for you—not as a distraction, but as someone genuinely in your corner. Your goals and your growth matter most, and I’m happiest seeing you thrive and focused on the life you’re building. Even from a distance, I’m cheering for your success simply because of who you are, with no expectations in return.",
        "I hate lies. I've noticed a few things I chose to stay quiet about. I'm still choosing to stay quiet about them here — because this isn't about that. This is about what I feel, stated clearly, with nothing hidden.",
        "You are the first person after seeing whom I wish to be better. The first person who made me feel like the work is worth it. If that means something to you — say so. If it doesn't — say that too.",
        'Either answer is better than silence.'
    ];

    timelineVisible: boolean[] = this.timelineEntries.map(() => false);
    confessionVisible: boolean[] = this.confessionParagraphs.map(() => false);
    questionVisible = false;
    selectedOption: string | null = null;

    particles: FloatingParticle[] = [];
    floatingEmojis: FloatingEmoji[] = [];

    private timelineObserver?: IntersectionObserver;
    private confessionObserver?: IntersectionObserver;
    private questionObserver?: IntersectionObserver;
    private timerId?: number;

    constructor() {
        this.particles = this.createParticles(15);
        const emojiCount = typeof window !== 'undefined' && window.innerWidth < 768 ? 14 : 28;
        this.floatingEmojis = this.createFloatingEmojis(emojiCount);
        this.countdownLabel = this.buildCountdownLabel();

        this.timerId = window.setInterval(() => {
            this.countdownLabel = this.buildCountdownLabel();
        }, 1000);
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.heroReady = true;
        }, 120);

        this.timelineObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(
                            (entry.target as HTMLElement).dataset['timelineIndex']
                        );
                        if (!Number.isNaN(index)) {
                            this.timelineVisible[index] = true;
                            this.timelineObserver?.unobserve(entry.target);
                        }
                    }
                });
            },
            {
                threshold: 0.3
            }
        );

        this.confessionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(
                            (entry.target as HTMLElement).dataset['confessionIndex']
                        );
                        if (!Number.isNaN(index)) {
                            this.confessionVisible[index] = true;
                            this.confessionObserver?.unobserve(entry.target);
                        }
                    }
                });
            },
            {
                threshold: 0.35
            }
        );

        this.questionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        this.questionVisible = true;
                        this.questionObserver?.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.5
            }
        );

        this.timelineCardRefs.forEach((ref, index) => {
            ref.nativeElement.dataset['timelineIndex'] = index.toString();
            this.timelineObserver?.observe(ref.nativeElement);
        });

        this.confessionParagraphRefs.forEach((ref, index) => {
            ref.nativeElement.dataset['confessionIndex'] = index.toString();
            this.confessionObserver?.observe(ref.nativeElement);
        });

        this.questionParagraphRefs.forEach((ref) => {
            this.questionObserver?.observe(ref.nativeElement);
        });
    }

    ngOnDestroy(): void {
        this.timelineObserver?.disconnect();
        this.confessionObserver?.disconnect();
        this.questionObserver?.disconnect();

        if (this.timerId) {
            window.clearInterval(this.timerId);
        }
    }

    signedDate(): string {
        return '— Shubham';
    }

    onOptionSelect(option: string): void {
        this.selectedOption = option;
    }

    getResponseMessage(): string {
        switch (this.selectedOption) {
            case 'Yes':
                return '🎉 Finally! A computer engineer and a electronics researcher walk into a relationship... 💻🔬 Let\'s debug this code of love together! 💕';
            case 'No':
                return '😏 Rejected by a PhD candidate? My algorithms didn\'t predict this. 🤖 But hey, at least my code compiles! ⭐';
            case 'Already have a boyfriend':
                return '🙌 Ah, the classic "already taken" error. 💾 Don\'t worry, I\'ll just refactor my heart and move on. Stay nano-awesome! ✨';
            default:
                return '';
        }
    }

    getWhatsAppLink(): string {
        let message = '';
        switch (this.selectedOption) {
            case 'Yes': message = "Code worked! YES. Let's optimize algorithms and debug some dates."; break;
            case 'No': message = "Nice try! It's a NO. Technical effort appreciated, keep coding!"; break;
            case 'Already have a boyfriend': message = "Impressive build! But I'm committed. My logic gates are closed, but I'm rooting for your next project."; break;
            default: message = `Regarding: ${this.selectedOption}`;
        }
        return `https://wa.me/919921471375?text=${message}`;
    }

    private buildCountdownLabel(): string {
        const now = new Date();
        const target = this.getNextSundayAtNight(now);
        const diff = target.getTime() - now.getTime();

        if (diff <= 0) {
            this.pageExpired = true;
            return 'This page disappears in: 0 days, 0 hours, 0 minutes, 0 seconds';
        }

        this.pageExpired = false;
        const totalSeconds = Math.floor(diff / 1000);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `This page disappears in: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
    }

private getNextSundayAtNight(from: Date): Date {
    const sunday = new Date(from);
    sunday.setHours(23, 59, 0, 0);
    const day = from.getDay();
    const sundayIndex = 0;
    const daysUntilSunday = (sundayIndex - day + 7) % 7;

    sunday.setDate(from.getDate() + daysUntilSunday);

    if (daysUntilSunday === 0 && from.getTime() > sunday.getTime()) {
      sunday.setDate(sunday.getDate() + 7);
    }

    return sunday;
    }

    private createParticles(count: number): FloatingParticle[] {
        return Array.from({ length: count }).map(() => ({
            left: Math.random() * 100,
            size: 4 + Math.random() * 6,
            duration: 15 + Math.random() * 10,
            delay: Math.random() * 14
        }));
    }

    private createFloatingEmojis(count: number): FloatingEmoji[] {
        const symbols = [
            '❤️',
            '💖',
            '💗',
            '💘',
            '🌹',
            '💌',
            '🥰',
            '🥺',
            '🧸',
            '🐥',
            '🍭',
            '✨',
            '👩‍❤️‍👨',
            '🧑‍🤝‍🧑',
            '🤝',
            '♾️',
            '🧩',
            '🔗',
            '🌙',
            '☁️',
            '🕯️',
            '🌊',
            '🌌'
        ];

        return Array.from({ length: count }).map(() => ({
            left: 2 + Math.random() * 96,
            size: 16 + Math.random() * 16,
            duration: 18 + Math.random() * 14,
            delay: Math.random() * 20,
            drift: -12 + Math.random() * 24,
            opacity: 0.45 + Math.random() * 0.4,
            symbol: symbols[Math.floor(Math.random() * symbols.length)]
        }));
    }
}
