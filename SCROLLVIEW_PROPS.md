# React Native ScrollView - Tüm Property'ler

## 📋 ScrollView Property'leri - Kategorize Liste

### 1. **Temel Scroll Property'leri**

- `scrollEnabled` - Scroll'u aktif/pasif yapar (boolean, default: true)
- `scrollTo` - Belirli bir pozisyona scroll yapar (function)
- `scrollToEnd` - Sona scroll yapar (function)
- `scrollToOffset` - Offset'e scroll yapar (function)
- `scrollEventThrottle` - Scroll event sıklığı (number, default: 0)
- `onScroll` - Scroll olduğunda çağrılan fonksiyon (function)
- `onScrollBeginDrag` - Scroll başladığında (function)
- `onScrollEndDrag` - Scroll bittiğinde (function)
- `onMomentumScrollBegin` - Momentum scroll başladığında (function)
- `onMomentumScrollEnd` - Momentum scroll bittiğinde (function)
- `onScrollToTop` - iOS'ta üste scroll yapıldığında (function)

### 2. **Görünüm Property'leri**

- `style` - ScrollView container stili (StyleProp<ViewStyle>)
- `contentContainerStyle` - İçerik container stili (StyleProp<ViewStyle>)
- `showsVerticalScrollIndicator` - Dikey scroll göstergesi (boolean, default: true)
- `showsHorizontalScrollIndicator` - Yatay scroll göstergesi (boolean, default: true)
- `indicatorStyle` - Scroll göstergesi rengi (iOS: 'default' | 'black' | 'white')
- `scrollIndicatorInsets` - Scroll göstergesi inset'leri (iOS)

### 3. **Bounce/Elastic Property'leri**

- `bounces` - Bounce efekti (boolean, default: true - iOS)
- `alwaysBounceVertical` - Her zaman dikey bounce (boolean, default: false - iOS)
- `alwaysBounceHorizontal` - Her zaman yatay bounce (boolean, default: false - iOS)
- `bounceZoom` - Zoom bounce (boolean, default: true - iOS)

### 4. **Klavye Property'leri**

- `keyboardShouldPersistTaps` - Klavye açıkken tap'leri işle ('never' | 'always' | 'handled')
- `keyboardDismissMode` - Klavye kapatma modu ('none' | 'on-drag' | 'interactive')
- `keyboardAvoidingViewEnabled` - KeyboardAvoidingView entegrasyonu (boolean, default: true - Android)

### 5. **Paging Property'leri**

- `pagingEnabled` - Sayfa sayfa scroll (boolean, default: false)
- `decelerationRate` - Yavaşlama hızı ('normal' | 'fast' | number)
- `snapToInterval` - Belirli aralıklara snap (number)
- `snapToAlignment` - Snap hizalaması ('start' | 'center' | 'end')
- `snapToOffsets` - Snap yapılacak offset'ler (number[])

### 6. **Nested Scroll Property'leri**

- `nestedScrollEnabled` - İç içe scroll desteği (boolean, default: false - Android)
- `scrollEventThrottle` - Scroll event throttle (number, default: 0)

### 7. **Refresh Control Property'leri**

- `refreshControl` - RefreshControl bileşeni (ReactElement)
- `onRefresh` - Pull-to-refresh callback (function)

### 8. **Sticky Header Property'leri**

- `stickyHeaderIndices` - Yapışkan header index'leri (number[])
- `stickyHeaderComponent` - Yapışkan header component (ReactElement)

### 9. **Scroll Direction Property'leri**

- `horizontal` - Yatay scroll (boolean, default: false)
- `directionalLockEnabled` - Tek yönlü scroll kilidi (boolean, default: false - iOS)

### 10. **Zoom Property'leri**

- `maximumZoomScale` - Maksimum zoom (number, default: 1.0)
- `minimumZoomScale` - Minimum zoom (number, default: 1.0)
- `zoomScale` - Mevcut zoom (number)
- `onScrollBeginZoom` - Zoom başladığında (function)
- `onScrollEndZoom` - Zoom bittiğinde (function)

### 11. **Content Offset Property'leri**

- `contentOffset` - Başlangıç scroll pozisyonu ({ x: number, y: number })
- `contentInset` - İçerik inset'leri (iOS: { top, bottom, left, right })
- `contentInsetAdjustmentBehavior` - İçerik inset ayarlama (iOS: 'automatic' | 'scrollableAxes' | 'never' | 'always')

### 12. **Scroll Bar Property'leri**

- `scrollBarThumbImage` - Scroll bar thumb resmi (iOS)
- `scrollBarTrackImage` - Scroll bar track resmi (iOS)
- `overScrollMode` - Over-scroll modu (Android: 'auto' | 'always' | 'never')

### 13. **Diğer Property'ler**

- `automaticallyAdjustContentInsets` - Otomatik içerik inset ayarı (boolean, default: true - iOS)
- `automaticallyAdjustKeyboardInsets` - Otomatik klavye inset ayarı (boolean, default: false - iOS)
- `canCancelContentTouches` - İçerik touch'larını iptal edebilir (boolean, default: true - iOS)
- `centerContent` - İçeriği ortala (boolean, default: false - iOS)
- `contentContainerStyle` - İçerik container stili
- `disableIntervalMomentum` - Interval momentum'u devre dışı bırak (boolean)
- `disableScrollViewPanResponder` - Pan responder'ı devre dışı bırak (boolean)
- `endFillColor` - Son doldurma rengi (Android: color string)
- `fadingEdgeLength` - Fading edge uzunluğu (Android: number)
- `maintainVisibleContentPosition` - Görünür içerik pozisyonunu koru (object)
- `maximumZoomScale` - Maksimum zoom (number)
- `minimumZoomScale` - Minimum zoom (number)
- `overScrollMode` - Over-scroll modu (Android)
- `persistentScrollbar` - Kalıcı scroll bar (boolean, default: false - Android)
- `pinchGestureEnabled` - Pinch gesture'ı aktif et (boolean, default: true - iOS)
- `removeClippedSubviews` - Kırpılmış subview'ları kaldır (boolean, default: true - Android)
- `scrollBarThumbImage` - Scroll bar thumb resmi (iOS)
- `scrollBarTrackImage` - Scroll bar track resmi (iOS)
- `scrollPerfTag` - Scroll performans tag'i (string)
- `scrollsToTop` - Üste scroll yapabilir (boolean, default: true - iOS)
- `showsVerticalScrollIndicator` - Dikey scroll göstergesi (boolean)
- `testID` - Test ID (string)
- `zoomScale` - Zoom ölçeği (number)

## 🔧 Scroll Sorunları ve Çözümleri

### Sorun: Scroll Çalışmıyor

**Nedenler:**

1. `contentContainerStyle`'da `flexGrow: 1` kullanılması
2. `scrollEnabled={false}` olması
3. İçeriğin ekran boyutundan küçük olması
4. `style`'da `height` veya `flex: 1` eksikliği

**Çözüm:**

```typescript
<ScrollView
  style={{ flex: 1 }} // ✅ Container flex: 1 olmalı
  contentContainerStyle={{
    padding: 16,
    paddingBottom: 120,
    // ❌ flexGrow: 1 kullanmayın - scroll'u engeller
  }}
  scrollEnabled={true} // ✅ Scroll'u aktif et
  showsVerticalScrollIndicator={true}
/>
```

### Sorun: Klavye Açıkken Scroll Çalışmıyor

**Çözüm:**

```typescript
<ScrollView
  keyboardShouldPersistTaps="handled" // ✅ Klavye açıkken tap'leri işle
  keyboardDismissMode="on-drag" // ✅ Scroll yaparken klavyeyi kapat
/>
```

### Sorun: İç İçe ScrollView Çalışmıyor

**Çözüm:**

```typescript
<ScrollView
  nestedScrollEnabled={true} // ✅ Android için gerekli
  keyboardShouldPersistTaps="handled"
/>
```

## 📝 Örnek Kullanım

```typescript
<ScrollView
  // Temel
  style={styles.scrollView}
  contentContainerStyle={styles.scrollContent}
  scrollEnabled={true}
  // Görünüm
  showsVerticalScrollIndicator={true}
  showsHorizontalScrollIndicator={false}
  // Bounce
  bounces={true}
  alwaysBounceVertical={false}
  // Klavye
  keyboardShouldPersistTaps="handled"
  keyboardDismissMode="on-drag"
  // Nested Scroll
  nestedScrollEnabled={true}
  // Event'ler
  onScroll={(event) => {
    // Scroll pozisyonu: event.nativeEvent.contentOffset.y
  }}
  scrollEventThrottle={16}
/>
```

## 🎯 Önerilen Stil Ayarları

```typescript
const styles = StyleSheet.create({
  scrollView: {
    flex: 1, // ✅ Container flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 120,
    // ❌ flexGrow: 1 kullanmayın - scroll'u engeller
    // ✅ İçerik yeterince uzunsa otomatik scroll çalışır
  },
});
```
