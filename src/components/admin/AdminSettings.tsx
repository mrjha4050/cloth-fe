import { useState, useEffect } from 'react';
import { Truck, Save } from 'lucide-react';
import { admin } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export function AdminSettings() {
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    admin
      .getSettings()
      .then((res) => {
        if (!cancelled && res?.shippingCost != null) {
          setShippingCost(Number(res.shippingCost));
        }
      })
      .catch(() => {
        if (!cancelled) toast.error('Could not load settings');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async () => {
    const value = Number(shippingCost);
    if (value < 0 || !Number.isFinite(value)) {
      toast.error('Enter a valid shipping cost (0 or more)');
      return;
    }
    setSaving(true);
    try {
      await admin.updateSettings({ shippingCost: value });
      toast.success('Shipping cost updated');
    } catch {
      toast.error('Could not update shipping cost');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <section className="border rounded-lg p-6 bg-card">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Shipping cost</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            This amount is charged when the order subtotal is below the free-shipping threshold. Used at checkout and when creating orders.
          </p>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[140px]">
              <Label htmlFor="shipping-cost" className="text-xs font-medium mb-1.5 block">
                Cost (₹)
              </Label>
              <Input
                id="shipping-cost"
                type="number"
                min={0}
                step={1}
                value={shippingCost}
                onChange={(e) => setShippingCost(Number(e.target.value) || 0)}
                className="w-full"
              />
            </div>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
