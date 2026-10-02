export interface StoredExpenseRecord {
  id: string;
  vendor: string;
  items: Array<{ name: string; price: number }>;
  subtotal: number;
  tax: number;
  total: number;
  category: string;
  timestamp: number;
}

export interface EmittedNotification {
  id: string;
  title: string;
  body: string;
  timestamp: number;
  actionType?: string;
  read: boolean;
}

export class AndroidActionLayer {
  private static instance: AndroidActionLayer;

  private notifications: EmittedNotification[] = [];
  private expenseLedger: StoredExpenseRecord[] = [
    {
      id: 'exp_01',
      vendor: 'Central Cafe & Bakery',
      items: [
        { name: 'Cappuccino x2', price: 9.0 },
        { name: 'Avocado Toast', price: 12.5 },
        { name: 'Blueberry Muffin', price: 4.5 }
      ],
      subtotal: 26.0,
      tax: 2.21,
      total: 28.21,
      category: 'Food & Dining',
      timestamp: Date.now() - 3600000 * 24
    }
  ];
  private fileSystem: Map<string, string> = new Map();

  private notificationListeners: Set<(notes: EmittedNotification[]) => void> = new Set();

  public static getInstance(): AndroidActionLayer {
    if (!AndroidActionLayer.instance) {
      AndroidActionLayer.instance = new AndroidActionLayer();
    }
    return AndroidActionLayer.instance;
  }

  public subscribeNotifications(cb: (notes: EmittedNotification[]) => void): () => void {
    this.notificationListeners.add(cb);
    cb([...this.notifications]);
    return () => this.notificationListeners.delete(cb);
  }

  private notifySubscribers(): void {
    for (const cb of this.notificationListeners) {
      cb([...this.notifications]);
    }
  }

  // --- 1. Notification Action ---
  public emitNotification(title: string, body: string, actionType?: string): EmittedNotification {
    const note: EmittedNotification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title,
      body,
      timestamp: Date.now(),
      actionType,
      read: false
    };

    this.notifications.unshift(note);
    this.notifySubscribers();

    // Browser Notification API if granted
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      try {
        new Notification(title, { body, icon: '/favicon.ico' });
      } catch (e) {
        // Fallback gracefully
      }
    }

    return note;
  }

  public getNotifications(): EmittedNotification[] {
    return [...this.notifications];
  }

  public dismissNotification(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notifySubscribers();
  }

  public recordExpense(data: {
    vendor?: string;
    items?: Array<{ name: string; price: number }>;
    subtotal?: number;
    tax?: number;
    total: number;
    category?: string;
  }): StoredExpenseRecord {
    const calculatedSubtotal = data.subtotal ?? (data.items ? data.items.reduce((s, i) => s + i.price, 0) : data.total);
    const calculatedTax = data.tax ?? 0;

    const record: StoredExpenseRecord = {
      id: `exp_${Date.now()}`,
      vendor: data.vendor || 'Unknown Merchant',
      items: data.items || [{ name: 'Assorted Bill Items', price: data.total }],
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      total: data.total,
      category: data.category || 'General Expense',
      timestamp: Date.now()
    };

    this.expenseLedger.unshift(record);

    this.emitNotification(
      'Expense Recorded Successfully',
      `Saved $${record.total.toFixed(2)} at ${record.vendor} (${record.category})`
    );

    return record;
  }

  public getExpenses(): StoredExpenseRecord[] {
    return [...this.expenseLedger];
  }

  // --- 3. File System Store Action ---
  public saveFile(filename: string, content: string): string {
    const path = `/data/user/0/com.satyagrah.ai/files/${filename}`;
    this.fileSystem.set(path, content);

    this.emitNotification(
      'File Saved to Android Storage',
      `Document "${filename}" (${content.length} chars) saved to local app sandbox.`
    );

    return path;
  }

  public getSavedFiles(): Array<{ path: string; size: number }> {
    return Array.from(this.fileSystem.entries()).map(([path, content]) => ({
      path,
      size: content.length
    }));
  }

  // --- 4. Share Action ---
  public async shareContent(title: string, text: string): Promise<boolean> {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text });
        return true;
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(`${title}\n\n${text}`);
      this.emitNotification('Copied to Clipboard', `Exported content from "${title}".`);
      return true;
    }

    return false;
  }
}
