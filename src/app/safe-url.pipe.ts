import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({
  name: 'safeUrl'
})
export class SafeUrlPipe implements PipeTransform {

  // Protocoles autorisés uniquement
  private readonly ALLOWED_PROTOCOLS = ['https:', 'http:', 'blob:'];

  constructor(private sanitizer: DomSanitizer) {}

  transform(url: any): SafeResourceUrl {
    if (!url || typeof url !== 'string') {
      return this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

    try {
      const parsed = new URL(url);
      if (!this.ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
        console.warn('SafeUrlPipe: protocole non autorisé bloqué :', parsed.protocol);
        return this.sanitizer.bypassSecurityTrustResourceUrl('');
      }
    } catch {
      // URL relative — on laisse passer (ex: /assets/...)
      if (url.startsWith('javascript:') || url.startsWith('data:')) {
        console.warn('SafeUrlPipe: URL dangereuse bloquée :', url);
        return this.sanitizer.bypassSecurityTrustResourceUrl('');
      }
    }

    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}