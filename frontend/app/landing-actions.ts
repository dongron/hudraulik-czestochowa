'use server'

export type ContactFormState = {
  status: 'idle' | 'success' | 'error'
  message: string | null
}

export async function submitContactForm(
  _prev: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '').trim()
  const phone = String(formData.get('phone') || '').trim()
  const message = String(formData.get('message') || '').trim()

  if (!name || !email || !message) {
    return {status: 'error', message: 'Wypełnij wszystkie wymagane pola.'}
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {status: 'error', message: 'Podaj poprawny adres e-mail.'}
  }

  // Mock submission — log only
  console.info('[contact-form] mock submission', {name, email, phone, messageLength: message.length})

  return {
    status: 'success',
    message: 'Dziękujemy! Skontaktujemy się z Tobą najszybciej jak to możliwe.',
  }
}
