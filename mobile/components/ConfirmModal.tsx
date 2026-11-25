import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AlertCircle,
  CheckCircle2,
  CopyPlus,
  DatabaseZap,
  LogOut,
  Trash2,
  X,
} from 'lucide-react-native';
import { getLocalizedItemName } from '@/constants/groceryCatalog';
import { useApp } from '@/hooks/useAppContext';

export const ConfirmModal: React.FC = () => {
  const { colors, t, language, confirmModal, confirmModalAction, cancelModalAction } =
    useApp();

  if (!confirmModal) return null;

  let title = '';
  let description = '';
  let confirmLabel = t.saveChanges;
  let isDanger = true;
  let IconComponent = Trash2;

  switch (confirmModal.type) {
    case 'delete-item':
      title = t.deleteItemTitle.replace(
        '{name}',
        getLocalizedItemName(confirmModal.item, language)
      );
      description = t.deleteItemDesc;
      confirmLabel = t.deleteItemConfirm;
      isDanger = true;
      IconComponent = Trash2;
      break;
    case 'duplicate-item':
      title = t.duplicateTitle;
      description = t.duplicateDesc.replace(
        '{name}',
        getLocalizedItemName({ name: confirmModal.pendingItem.name }, language)
      );
      confirmLabel = t.duplicateConfirm;
      isDanger = false;
      IconComponent = CopyPlus;
      break;
    case 'clear-purchased':
      title = t.clearPurchasedTitle;
      description = t.clearPurchasedDesc.replace('{count}', String(confirmModal.count));
      confirmLabel = t.clearPurchasedConfirm;
      isDanger = false;
      IconComponent = AlertCircle;
      break;
    case 'clear-all':
      title = t.clearAllTitle;
      description = t.clearAllDesc.replace('{count}', String(confirmModal.count));
      confirmLabel = t.clearAllConfirm;
      isDanger = true;
      IconComponent = Trash2;
      break;
    case 'delete-list':
      title = t.deleteListTitle.replace('{name}', confirmModal.list.name);
      description = t.deleteListDesc;
      confirmLabel = t.deleteListConfirm;
      isDanger = true;
      IconComponent = Trash2;
      break;
    case 'claim-local-data':
      title = t.claimLocalDataTitle;
      description = t.claimLocalDataDesc
        .replace('{items}', String(confirmModal.summary.itemCount))
        .replace('{email}', confirmModal.targetUserEmail);
      confirmLabel = t.claimLocalDataConfirm;
      isDanger = false;
      IconComponent = DatabaseZap;
      break;
    case 'sign-out':
      title = t.signOutConfirmTitle;
      description = t.signOutConfirmDesc;
      confirmLabel = t.signOutConfirmButton;
      isDanger = true;
      IconComponent = LogOut;
      break;
    case 'mark-bought':
      title = t.markBoughtTitle;
      description = t.markBoughtDesc.replace(
        '{name}',
        getLocalizedItemName(confirmModal.item, language)
      );
      confirmLabel = t.markBoughtConfirm;
      isDanger = false;
      IconComponent = CheckCircle2;
      break;
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={cancelModalAction}>
      <View style={[styles.backdrop, { backgroundColor: colors.overlay }]}>
        <View
          style={[
            styles.dialog,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.header}>
            <View
              style={[
                styles.iconWrap,
                {
                  backgroundColor: isDanger ? colors.roseSoft : colors.emeraldSoft,
                },
              ]}
            >
              <IconComponent
                size={20}
                color={isDanger ? colors.roseText : colors.emeraldText}
              />
            </View>
            <View style={styles.textWrap}>
              <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
              <Text style={[styles.desc, { color: colors.textSecondary }]}>
                {description}
              </Text>
            </View>
            <Pressable onPress={cancelModalAction} hitSlop={8}>
              <X size={18} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={cancelModalAction}
              style={[styles.btn, { backgroundColor: colors.surfaceSecondary }]}
            >
              <Text style={[styles.btnText, { color: colors.textSecondary }]}>
                {t.cancel}
              </Text>
            </Pressable>
            <Pressable
              onPress={confirmModalAction}
              style={[
                styles.btn,
                { backgroundColor: isDanger ? '#E11D48' : colors.emerald },
              ]}
            >
              <Text style={[styles.btnText, { color: '#FFFFFF' }]}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  dialog: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  desc: {
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btn: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
