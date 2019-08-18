import {
  trigger,
  animate,
  style,
  group,
  query,
  transition,
} from '@angular/animations';

export const slideInAnimation =
  trigger('routeAnimations', [
    transition('* => *', [
      query(':enter, :leave', style({ position: 'fixed', width: '100%' }), { optional: true }),
      group([
        query(':enter', [
          style({ transform: 'translateY(500px)', opacity: 0 }),
          animate('0.3s 0.3s ease-in',
          style({ transform: 'translateY(0%)', opacity: 1 }))
        ], { optional: true }),
        query(':leave', [
          style({ transform: 'scale(1)', transformOrigin: 'top'}),
          animate('0.4s ease-in-out',
          style({ transform: 'scale(0.5)', transformOrigin: 'top', opacity: 0 }))
        ], { optional: true }),
      ])
    ]),
  ]);
